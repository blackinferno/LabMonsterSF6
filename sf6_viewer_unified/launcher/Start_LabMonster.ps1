param(
    [string]$Repo = "blackinferno/LabMonsterSF6",
    [switch]$SkipUpdateCheck,
    [switch]$NoLaunch
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-ScriptRoot {
    if ($PSScriptRoot) {
        return $PSScriptRoot
    }
    if ($PSCommandPath) {
        return Split-Path -Parent $PSCommandPath
    }
    throw "Unable to resolve script root path."
}

function Resolve-AppRoot([string]$ScriptRoot) {
    $candidateLocal = Join-Path $ScriptRoot "index.html"
    if (Test-Path $candidateLocal) {
        return $ScriptRoot
    }
    $parent = Split-Path -Parent $ScriptRoot
    $candidateParent = Join-Path $parent "index.html"
    if (Test-Path $candidateParent) {
        return $parent
    }
    throw "Could not resolve app root from script root: $ScriptRoot"
}

function Parse-SemVer([string]$Value) {
    $raw = ([string]$Value).Trim()
    if ($raw.StartsWith("v", [System.StringComparison]::OrdinalIgnoreCase)) {
        $raw = $raw.Substring(1)
    }
    $parts = $raw.Split(".")
    $out = @(0, 0, 0)
    for ($i = 0; $i -lt 3; $i++) {
        $n = 0
        if ($i -lt $parts.Length) {
            [void][int]::TryParse($parts[$i], [ref]$n)
        }
        $out[$i] = $n
    }
    return $out
}

function Compare-SemVer([string]$A, [string]$B) {
    $av = Parse-SemVer $A
    $bv = Parse-SemVer $B
    for ($i = 0; $i -lt 3; $i++) {
        if ($av[$i] -gt $bv[$i]) { return 1 }
        if ($av[$i] -lt $bv[$i]) { return -1 }
    }
    return 0
}

function Get-LocalVersion([string]$AppRoot) {
    $updatesTxt = Join-Path $AppRoot "assets\data\updates.txt"
    if (Test-Path $updatesTxt) {
        $content = Get-Content -Path $updatesTxt -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $m = [regex]::Match($content, "(?im)^\s*CURRENT_VERSION:\s*([^\s]+)\s*$")
            if ($m.Success) {
                return $m.Groups[1].Value.Trim()
            }
        }
    }

    $indexPath = Join-Path $AppRoot "index.html"
    if (Test-Path $indexPath) {
        $html = Get-Content -Path $indexPath -Raw -ErrorAction SilentlyContinue
        if ($html) {
            $m = [regex]::Match($html, 'data-version="([^"]+)"')
            if ($m.Success) {
                return $m.Groups[1].Value.Trim()
            }
        }
    }

    return "0.0.0"
}

function Get-GitHubJson([string]$Url) {
    $headers = @{
        "User-Agent" = "LabMonsterLauncher"
        "Accept" = "application/vnd.github+json"
    }
    $token = [string]$env:GITHUB_TOKEN
    if ($token.Trim()) {
        $headers["Authorization"] = "Bearer $token"
    }
    return Invoke-RestMethod -Uri $Url -Headers $headers -Method Get -TimeoutSec 20
}

function Get-LatestReleaseTag([string]$RepoName) {
    $release = Get-GitHubJson "https://api.github.com/repos/$RepoName/releases/latest"
    $tag = [string]$release.tag_name
    if (-not $tag.Trim()) {
        throw "Latest release tag is missing."
    }
    return $tag.Trim()
}

function Sync-DirectoryMirror([string]$SourceDir, [string]$TargetDir) {
    if (-not (Test-Path $SourceDir)) {
        throw "Source directory missing: $SourceDir"
    }
    if (-not (Test-Path $TargetDir)) {
        New-Item -Path $TargetDir -ItemType Directory -Force | Out-Null
    }
    & robocopy $SourceDir $TargetDir /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
    $code = $LASTEXITCODE
    if ($code -ge 8) {
        throw "robocopy failed with exit code $code while syncing '$SourceDir' -> '$TargetDir'."
    }
}

function Apply-Update([string]$RepoName, [string]$Tag, [string]$AppRoot) {
    Write-Host "[update] Downloading $Tag ..."
    $tmpRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("labmonster_update_" + [guid]::NewGuid().ToString("N"))
    $zipPath = Join-Path $tmpRoot "release.zip"
    $extractDir = Join-Path $tmpRoot "extract"
    New-Item -Path $tmpRoot -ItemType Directory -Force | Out-Null
    New-Item -Path $extractDir -ItemType Directory -Force | Out-Null

    try {
        $zipUrl = "https://github.com/$RepoName/archive/refs/tags/$Tag.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -TimeoutSec 120
        Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

        $runtimeDir = Get-ChildItem -Path $extractDir -Recurse -Directory -Filter "sf6_viewer_unified" |
            Select-Object -First 1
        if (-not $runtimeDir) {
            throw "Could not find 'sf6_viewer_unified' in downloaded package."
        }

        $srcRoot = $runtimeDir.FullName
        $srcAssets = Join-Path $srcRoot "assets"
        $dstAssets = Join-Path $AppRoot "assets"
        Sync-DirectoryMirror -SourceDir $srcAssets -TargetDir $dstAssets

        $srcIndex = Join-Path $srcRoot "index.html"
        $dstIndex = Join-Path $AppRoot "index.html"
        if (-not (Test-Path $srcIndex)) {
            throw "Downloaded package is missing index.html"
        }
        Copy-Item -Path $srcIndex -Destination $dstIndex -Force

        $srcLauncherDir = Join-Path $srcRoot "launcher"
        $dstLauncherDir = Join-Path $AppRoot "launcher"
        if (-not (Test-Path $dstLauncherDir)) {
            New-Item -Path $dstLauncherDir -ItemType Directory -Force | Out-Null
        }
        if (Test-Path $srcLauncherDir) {
            $srcPs = Join-Path $srcLauncherDir "Start_LabMonster.ps1"
            if (Test-Path $srcPs) {
                $dstPs = Join-Path $dstLauncherDir "Start_LabMonster.ps1.new"
                Copy-Item -Path $srcPs -Destination $dstPs -Force
            }
            $srcUpdateBat = Join-Path $srcLauncherDir "Update_LabMonster.bat"
            if (Test-Path $srcUpdateBat) {
                $dstUpdateBat = Join-Path $dstLauncherDir "Update_LabMonster.bat"
                Copy-Item -Path $srcUpdateBat -Destination $dstUpdateBat -Force
            }
        }
        else {
            # Backward compatibility for older packages that kept launcher files at root.
            $srcPsLegacy = Join-Path $srcRoot "Start_LabMonster.ps1"
            if (Test-Path $srcPsLegacy) {
                $dstPs = Join-Path $dstLauncherDir "Start_LabMonster.ps1.new"
                Copy-Item -Path $srcPsLegacy -Destination $dstPs -Force
            }
            $srcUpdateBatLegacy = Join-Path $srcRoot "Update_LabMonster.bat"
            if (Test-Path $srcUpdateBatLegacy) {
                $dstUpdateBat = Join-Path $dstLauncherDir "Update_LabMonster.bat"
                Copy-Item -Path $srcUpdateBatLegacy -Destination $dstUpdateBat -Force
            }
        }
        $srcBat = Join-Path $srcRoot "Start_LabMonster.bat"
        if (Test-Path $srcBat) {
            $dstBat = Join-Path $AppRoot "Start_LabMonster.bat"
            Copy-Item -Path $srcBat -Destination $dstBat -Force
        }

        Write-Host "[update] Update applied: $Tag"
    }
    finally {
        if (Test-Path $tmpRoot) {
            Remove-Item -Path $tmpRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

$scriptRoot = Get-ScriptRoot
$appRoot = Resolve-AppRoot -ScriptRoot $scriptRoot
$indexPath = Join-Path $appRoot "index.html"
if (-not (Test-Path $indexPath)) {
    throw "index.html not found: $indexPath"
}

try {
    if (-not $SkipUpdateCheck) {
        $localVersion = Get-LocalVersion -AppRoot $appRoot
        $latestTag = Get-LatestReleaseTag -RepoName $Repo
        $latestVersion = ($latestTag -replace "^[vV]", "")

        Write-Host "[update] Local version: $localVersion"
        Write-Host "[update] Latest version: $latestVersion ($latestTag)"

        if ((Compare-SemVer $latestVersion $localVersion) -gt 0) {
            Apply-Update -RepoName $Repo -Tag $latestTag -AppRoot $appRoot
        }
        else {
            Write-Host "[update] Already up to date."
        }
    }
}
catch {
    Write-Warning ("Update check failed: " + $_.Exception.Message)
    Write-Warning "Starting current local version."
}

try {
    $newLauncher = Join-Path $scriptRoot "Start_LabMonster.ps1.new"
    if (Test-Path $newLauncher) {
        Move-Item -Path $newLauncher -Destination (Join-Path $scriptRoot "Start_LabMonster.ps1") -Force
    }
}
catch {
    Write-Warning ("Failed to finalize launcher self-update: " + $_.Exception.Message)
}

if (-not $NoLaunch) {
    Start-Process -FilePath $indexPath | Out-Null
}
