param(
    [string]$AppRoot = ""
)

$ErrorActionPreference = "Stop"

function Get-ScriptRoot {
    if ($PSScriptRoot) { return $PSScriptRoot }
    if ($PSCommandPath) { return (Split-Path -Parent $PSCommandPath) }
    throw "Unable to resolve script root path."
}

function Resolve-AppRoot([string]$ScriptRoot, [string]$PassedAppRoot) {
    if ($PassedAppRoot.Trim()) {
        return (Resolve-Path $PassedAppRoot).Path
    }
    return (Split-Path -Parent $ScriptRoot)
}

function Ensure-Icon([string]$PngPath, [string]$IcoPath) {
    if (-not (Test-Path $PngPath)) {
        throw "Icon source PNG not found: $PngPath"
    }

    Add-Type -AssemblyName System.Drawing
    $src = [System.Drawing.Image]::FromFile($PngPath)
    $bmp = New-Object System.Drawing.Bitmap 256, 256
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)

    try {
        $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $gfx.Clear([System.Drawing.Color]::Transparent)
        $gfx.DrawImage($src, 0, 0, 256, 256)

        $icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
        try {
            $stream = [System.IO.File]::Open($IcoPath, [System.IO.FileMode]::Create)
            try {
                $icon.Save($stream)
            }
            finally {
                $stream.Close()
            }
        }
        finally {
            $icon.Dispose()
        }
    }
    finally {
        $gfx.Dispose()
        $bmp.Dispose()
        $src.Dispose()
    }
}

$scriptRoot = Get-ScriptRoot
$resolvedAppRoot = Resolve-AppRoot -ScriptRoot $scriptRoot -PassedAppRoot $AppRoot

$sourcePath = Join-Path $scriptRoot "Start_LabMonsterLauncher.cs"
$exePath = Join-Path $resolvedAppRoot "Start_LabMonster.exe"
$pngPath = Join-Path $resolvedAppRoot "assets\images\misc\LabMonster_fav.png"
$icoPath = Join-Path $resolvedAppRoot "assets\images\misc\LabMonster_fav.ico"

Ensure-Icon -PngPath $pngPath -IcoPath $icoPath

$cscPath = Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe"
if (-not (Test-Path $cscPath)) {
    throw "C# compiler not found: $cscPath"
}

& $cscPath `
    /nologo `
    /target:winexe `
    /optimize+ `
    /platform:anycpu `
    /win32icon:"$icoPath" `
    /out:"$exePath" `
    "$sourcePath"

if ($LASTEXITCODE -ne 0) {
    throw "EXE build failed with exit code $LASTEXITCODE."
}

Write-Host "Built launcher: $exePath"
