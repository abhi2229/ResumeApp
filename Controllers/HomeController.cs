using Microsoft.AspNetCore.Mvc;
using ResumeApp.Models;
using ResumeApp.Services;

namespace ResumeApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ResumeDataService _resumeDataService;

        public HomeController(ResumeDataService resumeDataService)
        {
            _resumeDataService = resumeDataService;
        }

        public IActionResult Index()
        {
            var model = _resumeDataService.GetResumeData();
            return View(model);
        }
    }
}
