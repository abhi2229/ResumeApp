using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using ResumeApp.Models;
using ResumeApp.Services;

namespace ResumeApp.Controllers
{
    public class AdminController : Controller
    {
        private readonly ResumeDataService _dataService;
        private readonly IConfiguration _configuration;
        private const string AdminSessionKey = "IsAdminLoggedIn";

        public AdminController(ResumeDataService dataService, IConfiguration configuration)
        {
            _dataService = dataService;
            _configuration = configuration;
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
    }
}
