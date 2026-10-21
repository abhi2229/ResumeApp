using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using ResumeApp.Models;
using ResumeApp.Services;
using System.Text.Json;

namespace ResumeApp.Controllers
{
    public class AdminController : Controller
    {
        private readonly ResumeDataService _dataService;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private const string AdminSessionKey = "IsAdminLoggedIn";
        private const long MaxPhotoBytes = 5 * 1024 * 1024;

        public AdminController(ResumeDataService dataService, IConfiguration configuration, IWebHostEnvironment environment)
        {
            _dataService = dataService;
            _configuration = configuration;
            _environment = environment;
        }

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var adminUser = _configuration["AdminCredentials:Username"] ?? "admin";
            var adminPass = _configuration["AdminCredentials:Password"] ?? "Admin@Resume2026";

            if (request != null && request.Username == adminUser && request.Password == adminPass)
            {
                HttpContext.Session.SetString(AdminSessionKey, "true");
                return Json(new { success = true, message = "Login successful" });
            }

            return Json(new { success = false, message = "Invalid admin username or password" });
        }

        [HttpPost]
        public IActionResult Logout()
        {
            HttpContext.Session.Remove(AdminSessionKey);
            return Json(new { success = true, message = "Logged out successfully" });
        }

        [HttpGet]
        public IActionResult Status()
        {
            var isLoggedIn = HttpContext.Session.GetString(AdminSessionKey) == "true";
            return Json(new { isAdmin = isLoggedIn });
        }

        [HttpPost]
        public IActionResult UpdateData([FromBody] ResumeViewModel model)
        {
            var isLoggedIn = HttpContext.Session.GetString(AdminSessionKey) == "true";
            if (!isLoggedIn)
            {
                return Json(new { success = false, message = "Unauthorized. Admin session required." });
            }

            if (model == null)
            {
                return Json(new { success = false, message = "Invalid data payload." });
            }

            _dataService.SaveResumeData(model);
            return Json(new { success = true, lastUpdated = model.LastUpdated, message = "Resume content updated successfully!" });
        }

        [HttpPost]
        [RequestSizeLimit(6 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 6 * 1024 * 1024)]
        public async Task<IActionResult> SaveAllWithPhoto([FromForm] string model, [FromForm] IFormFile? photo)
        {
            if (HttpContext.Session.GetString(AdminSessionKey) != "true")
            {
                return StatusCode(StatusCodes.Status401Unauthorized,
                    new { success = false, message = "Admin login is required to save resume changes." });
            }

            if (string.IsNullOrWhiteSpace(model))
            {
                return BadRequest(new { success = false, message = "The resume data is missing." });
            }

            ResumeViewModel? resumeModel;
            try
            {
                resumeModel = JsonSerializer.Deserialize<ResumeViewModel>(model, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException)
            {
                return BadRequest(new { success = false, message = "The resume data is invalid." });
            }

            if (resumeModel == null)
            {
                return BadRequest(new { success = false, message = "The resume data is invalid." });
            }

            byte[]? imageBytes = null;
            string? extension = null;
            if (photo != null)
            {
                if (photo.Length == 0)
                {
                    return BadRequest(new { success = false, message = "The selected photo is empty." });
                }

                if (photo.Length > MaxPhotoBytes)
                {
                    return BadRequest(new { success = false, message = "The image must be 5 MB or smaller." });
                }

                await using var uploadStream = new MemoryStream();
                await photo.CopyToAsync(uploadStream);
                imageBytes = uploadStream.ToArray();
                extension = GetSupportedImageExtension(imageBytes);
                if (extension == null)
                {
                    return BadRequest(new { success = false, message = "Use a valid JPEG, PNG, or WebP image." });
                }
            }

            var imageDirectory = Path.Combine(_environment.WebRootPath, "image");
            string? fileName = null;
            string? filePath = null;
            string? photoUrl = null;
            var previousPhotoUrl = resumeModel.Profile?.PhotoUrl;

            try
            {
                if (imageBytes != null && extension != null)
                {
                    Directory.CreateDirectory(imageDirectory);
                    fileName = $"profile-upload-{Guid.NewGuid():N}.{extension}";
                    filePath = Path.Combine(imageDirectory, fileName);
                    photoUrl = $"/image/{fileName}";
                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);
                    resumeModel.Profile ??= new Profile();
                    resumeModel.Profile.PhotoUrl = photoUrl;
                }

                _dataService.SaveResumeData(resumeModel);
            }
            catch
            {
                try
                {
                    if (filePath != null && System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                catch (IOException)
                {
                    // Preserve the original save failure response if cleanup also fails.
                }

                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = "The photo could not be saved. Please try again." });
            }

            if (fileName != null)
            {
                DeletePreviousUploadedPhoto(previousPhotoUrl, imageDirectory, fileName);
            }

            return Json(new { success = true, photoUrl, lastUpdated = resumeModel.LastUpdated });
        }

        private static string? GetSupportedImageExtension(byte[] bytes)
        {
            if (bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
            {
                return "jpg";
            }

            if (bytes.Length >= 8 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47 &&
                bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A)
            {
                return "png";
            }

            if (bytes.Length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P')
            {
                return "webp";
            }

            return null;
        }

        private static void DeletePreviousUploadedPhoto(string? previousPhotoUrl, string imageDirectory, string currentFileName)
        {
            if (string.IsNullOrWhiteSpace(previousPhotoUrl) || !previousPhotoUrl.StartsWith("/image/profile-upload-", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var previousFileName = Path.GetFileName(previousPhotoUrl);
            if (previousFileName.StartsWith("profile-upload-", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(previousFileName, currentFileName, StringComparison.OrdinalIgnoreCase))
            {
                var previousPath = Path.Combine(imageDirectory, previousFileName);
                if (System.IO.File.Exists(previousPath))
                {
                    try
                    {
                        System.IO.File.Delete(previousPath);
                    }
                    catch (IOException)
                    {
                        // A stale uploaded image can be cleaned up later.
                    }
                }
            }
        }
    }
}
