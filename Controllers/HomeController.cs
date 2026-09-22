using Microsoft.AspNetCore.Mvc;
using ResumeApp.Models;
using ResumeApp.Services;

namespace ResumeApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ResumeDataService _dataService;

        public HomeController(ResumeDataService dataService)
        {
            _dataService = dataService;
        }

        public IActionResult Index()
        {
            var model = _dataService.GetResumeData();
            return View(model);
        }
    }
}

