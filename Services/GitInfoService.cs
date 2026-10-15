using System.Diagnostics;
using System.Runtime.InteropServices;

namespace ResumeApp.Services
{
    public interface IGitInfoService
    {
        DateTime GetLastCommitDate();
    }

    public class GitInfoService : IGitInfoService
    {
        private readonly ILogger<GitInfoService> _logger;
        private readonly IWebHostEnvironment _env;

        public GitInfoService(ILogger<GitInfoService> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        public DateTime GetLastCommitDate()
        {
            try
            {
                var gitPath = "git"; // Default to system PATH

                // On Windows, try common installation paths if git is not in PATH
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    var commonPaths = new[]
                    {
                        "C:\\Program Files\\Git\\bin\\git.exe",
                        "C:\\Program Files (x86)\\Git\\bin\\git.exe",
                        "C:\\tools\\git\\bin\\git.exe"
                    };

                    foreach (var path in commonPaths)
                    {
                        if (File.Exists(path))
                        {
                            gitPath = path;
                            break;
                        }
                    }
                }

                var processInfo = new ProcessStartInfo
                {
                    FileName = gitPath,
                    Arguments = "log -1 --format=%ci",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    WorkingDirectory = _env.ContentRootPath  // Set the working directory to the project root
                };

                using (var process = Process.Start(processInfo))
                {
                    if (process != null)
                    {
                        var output = process.StandardOutput.ReadToEnd().Trim();
                        var error = process.StandardError.ReadToEnd().Trim();
                        process.WaitForExit(5000); // Wait max 5 seconds

                        if (!string.IsNullOrEmpty(error))
                        {
                            _logger.LogWarning($"Git error: {error}");
                        }

                        // The output format from %ci is: YYYY-MM-DD HH:MM:SS +ZZZZ
                        if (!string.IsNullOrEmpty(output) && DateTime.TryParse(output, out var commitDate))
                        {
                            _logger.LogInformation($"Last commit date retrieved: {commitDate:yyyy-MM-dd HH:mm:ss}");
                            return commitDate;
                        }
                        else if (!string.IsNullOrEmpty(output))
                        {
                            _logger.LogWarning($"Failed to parse commit date from: '{output}'");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to get Git commit date: {ex.Message}. Returning current date.");
            }

            return DateTime.Now;
        }
    }
}
