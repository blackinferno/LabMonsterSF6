using System;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace LabMonsterLauncher
{
    internal static class Program
    {
        private static int Main(string[] args)
        {
            string appRoot = AppDomain.CurrentDomain.BaseDirectory.TrimEnd(
                Path.DirectorySeparatorChar,
                Path.AltDirectorySeparatorChar
            );

            string launcherScript = Path.Combine(appRoot, "launcher", "Start_LabMonster.ps1");
            if (File.Exists(launcherScript))
            {
                var psi = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = "-NoProfile -ExecutionPolicy Bypass -File " + QuoteArg(launcherScript) + BuildArgs(args),
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                try
                {
                    using (Process process = Process.Start(psi))
                    {
                        if (process != null)
                        {
                            process.WaitForExit();
                            if (process.ExitCode == 0)
                            {
                                return 0;
                            }
                        }
                    }
                }
                catch
                {
                    // Fall back to opening index.html directly.
                }
            }

            string indexPath = Path.Combine(appRoot, "index.html");
            if (File.Exists(indexPath))
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = indexPath,
                        UseShellExecute = true
                    });
                    return 0;
                }
                catch
                {
                    // no-op
                }
            }

            return 1;
        }

        private static string BuildArgs(string[] args)
        {
            if (args == null || args.Length == 0)
            {
                return string.Empty;
            }

            var sb = new StringBuilder();
            foreach (string arg in args)
            {
                sb.Append(' ');
                sb.Append(QuoteArg(arg));
            }
            return sb.ToString();
        }

        private static string QuoteArg(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return "\"\"";
            }

            bool needsQuotes = value.IndexOfAny(new[] { ' ', '\t', '"' }) >= 0;
            if (!needsQuotes)
            {
                return value;
            }

            return "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
        }
    }
}
