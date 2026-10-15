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
            // Resume data lives 
            var model = new ResumeViewModel
            {
                Profile = new Profile
                {
                    Name        = "Abhishek Maiti",
                    Initials    = "AM",
                    Title       = "Enablon Consultant · Cognizant",
                    Bio         = "Enablon Consultant specializing in Metrics and NABSIC logic, with hands-on experience supporting pharmaceutical clients in production environments.\nFocused on resolving complex aggregation and consolidation issues, improving data accuracy, and delivering reliable KPI reporting.\nCurrently expanding into Azure and Angular to build end-to-end scalable solutions.",
                    Email       = "maity2229@gmail.com",
                    Phone       = "+91 7602968387",
                    Location    = "Hyderabad, Telangana, India",
                    LinkedIn    = "https://www.linkedin.com/in/abhishek-maiti-328614181"
                },
                SkillGroups = new List<SkillGroup>
                {
                    new SkillGroup
                    {
                        Category = "Enablon Platform",
                        Skills   = new List<Skill>
                        {
                            new Skill { Name = "Metrics Module",      IsPrimary = true },
                            new Skill { Name = "GXP Module",          IsPrimary = true },
                            new Skill { Name = "NABSIC Rules",        IsPrimary = true },
                            new Skill { Name = "Shared Functions",    IsPrimary = true },
                            new Skill { Name = "EHS Management",      IsPrimary = false },
                            new Skill { Name = "Incident Management", IsPrimary = false },
                            new Skill { Name = "Risk Management",     IsPrimary = false },
                            new Skill { Name = "Proton Lifecycle Management Tool",    IsPrimary = false }
                        }
                    },
                    new SkillGroup
                    {
                        Category = "Development",
                        Skills   = new List<Skill>
                        {
                            new Skill { Name = "ADO.NET MVC",    IsPrimary = true },
                            new Skill { Name = "C#",         IsPrimary = true },
                            new Skill { Name = "SQL",        IsPrimary = true },
                            new Skill { Name = "NABSIC",     IsPrimary = true },
                            new Skill { Name = "JavaScript", IsPrimary = false },
                            new Skill { Name = "POSTMAN",    IsPrimary = false },
                            new Skill { Name = "HTML / CSS", IsPrimary = false }
                        }
                    },
                    new SkillGroup
                    {
                        Category = "Upskilling",
                        Skills   = new List<Skill>
                        {
                            new Skill { Name = "Azure",   IsPrimary = true },
                            new Skill { Name = "Angular", IsPrimary = true }
                        }
                    },
                    new SkillGroup
                    {
                        Category = "Domain & Process",
                        Skills   = new List<Skill>
                        {
                            new Skill { Name = "Pharmaceutical Domain", IsPrimary = false },
                            new Skill { Name = "SDLC",                  IsPrimary = true },
                            new Skill { Name = "UAT Support",           IsPrimary = false },
                            new Skill { Name = "Production Support",    IsPrimary = false },
                            new Skill { Name = "Business Analysis",     IsPrimary = false }
                        }
                    }
                },
                Projects = new List<Project>
                {
                    new Project
                    {
                        Title        = "Enablon Metrics Configuration",
                        Description  = "End-to-end configuration and support of the Metrics module for two pharmaceutical clients, including NABSIC rule logic building, production issue resolution, and UAT collaboration.",
                        Technologies = new List<string> { "Enablon", "NABSIC", "Metrics Module", "Proton" }
                    },
                    new Project
                    {
                        Title        = "Production Issue Analysis",
                        Description  = "Systematic root-cause analysis and resolution of production issues in the Enablon platform, coordinating with functional and business teams to minimise downtime.",
                        Technologies = new List<string> { "Enablon", "Incident Management", "Risk Management" }
                    },
                    new Project
                    {
                        Title        = ".NET Internship Project",
                        Description  = "Developed web application modules during internship using .NET Framework and JavaScript, applying enterprise development best practices.",
                        Technologies = new List<string> { ".NET Framework", "JavaScript", "ASP.NET", "HTML / CSS" }
                    }
                },
                Certifications = new List<Certification>
                {
                    new Certification
                    {
                        Name   = "Database Management System",
                        Issuer = "NPTEL",
                        Year   = "2022",
                        CertificateUrl = "https://archive.nptel.ac.in/noc/Ecertificate/?q=NPTEL22CS51S33750500NPTEL2201053954"
                    },
                    new Certification
                    {
                        Name   = "Web Development with HTML,CSS and JS",
                        Issuer = "Coursera",
                        Year   = "2022",
                        CertificateUrl = "https://www.coursera.org/account/accomplishments/certificate/8FQ55JT76TVH" 
                    }
                }
            };

            return View(model);
        }
    }
}
