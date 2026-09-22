using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using ResumeApp.Models;

namespace ResumeApp.Services
{
    public class ResumeDataService
    {
        private readonly string _filePath;
        private static readonly object _fileLock = new();

        public ResumeDataService(string webRootPath)
        {
            _filePath = Path.Combine(webRootPath, "resumeData.json");
            EnsureDataExists();
        }

        public ResumeViewModel GetResumeData()
        {
            lock (_fileLock)
            {
                if (!File.Exists(_filePath))
                {
                    var seed = GetSeedData();
                    SaveResumeData(seed);
                    return seed;
                }

                try
                {
                    var json = File.ReadAllText(_filePath);
                    var model = JsonSerializer.Deserialize<ResumeViewModel>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    return model ?? GetSeedData();
                }
                catch
                {
                    return GetSeedData();
                }
            }
        }

        public void SaveResumeData(ResumeViewModel model)
        {
            lock (_fileLock)
            {
                model.LastUpdated = DateTime.UtcNow.ToString("dd MMM yyyy, hh:mm tt 'UTC'");
                var options = new JsonSerializerOptions { WriteIndented = true };
                var json = JsonSerializer.Serialize(model, options);
                File.WriteAllText(_filePath, json);
            }
        }

        private void EnsureDataExists()
        {
            if (!File.Exists(_filePath))
            {
                var seed = GetSeedData();
                SaveResumeData(seed);
            }
        }

        public static ResumeViewModel GetSeedData()
        {
            return new ResumeViewModel
            {
                LastUpdated = DateTime.UtcNow.ToString("dd MMM yyyy, hh:mm tt 'UTC'"),
                Profile = new Profile
                {
                    Name = "Abhishek Maiti",
                    Initials = "AM",
                    Title = "Enablon Consultant · Cognizant",
                    Bio = "Enablon Consultant specializing in Metrics and NABSIC logic, with hands-on experience supporting pharmaceutical clients in production environments.\nFocused on resolving complex aggregation and consolidation issues, improving data accuracy, and delivering reliable KPI reporting.\nCurrently expanding into Azure and Angular to build end-to-end scalable solutions.",
                    Email = "maity2229@gmail.com",
                    Phone = "+91 7602968387",
                    Location = "Hyderabad, Telangana, India",
                    LinkedIn = "https://www.linkedin.com/in/abhishek-maiti-328614181"
                },
                Experiences = new List<Experience>
                {
                    new Experience
                    {
                        Id = "exp_1",
                        Company = "Cognizant",
                        EmploymentType = "Full-time · HYD",
                        Role = "Programmer Analyst",
                        Period = "Sep 2025 – Present",
                        Bullets = new List<string>
                        {
                            "Providing Enablon platform support and configuration for pharmaceutical clients, focusing on the Metrics and GXP modules.",
                            "Analysing and resolving production issues, performing root-cause analysis and coordinating fixes with functional teams.",
                            "Building and validating NABSIC rules to address complex business requirements and ensure data accuracy.",
                            "Created customized KPIs using Business Analyzer Templates (BAT) with advanced aggregation logic (SUM, AVG) and consolidation algorithms.",
                            "Resolved consolidation issues involving monthly vs quarterly calculation variance and NULL vs 0 value handling in data aggregation.",
                            "Supporting UAT cycles by collaborating closely with business stakeholders to verify configurations meet requirements.",
                            "Working with Shared Functions, Incident Management and Risk Management modules in Enablon.",
                            "Following SDLC best practices throughout the development and support lifecycle."
                        }
                    },
                    new Experience
                    {
                        Id = "exp_2",
                        Company = "Cognizant",
                        EmploymentType = "Full-time · HYD",
                        Role = "Programmer Analyst Trainee",
                        Period = "Sep 2024 – Sep 2025",
                        Bullets = new List<string>
                        {
                            "Configured and maintained Enablon Metrics module for pharmaceutical domain clients.",
                            "Assisted in logic building for NABSIC rules and supported production issue triage.",
                            "Collaborated with functional teams on platform configuration and business requirement mapping.",
                            "Gained working knowledge of Enablon's Incident Management and Risk Management modules.",
                            "Worked on documentation and maintained documentation in the PROTON Life Cycle Management tool."
                        }
                    },
                    new Experience
                    {
                        Id = "exp_3",
                        Company = "Cognizant",
                        EmploymentType = "Internship · HYD",
                        Role = "Programmer Analyst Trainee",
                        Period = "Dec 2023 – Apr 2024",
                        Bullets = new List<string>
                        {
                            "Trained in .NET Framework fundamentals and applied skills in hands-on development tasks.",
                            "Worked with JavaScript and web technologies as part of the internship curriculum.",
                            "Gained exposure to enterprise software development practices and Agile workflows."
                        }
                    }
                },
                SkillGroups = new List<SkillGroup>
                {
                    new SkillGroup
                    {
                        Id = "sg_1",
                        Category = "Enablon Platform",
                        Skills = new List<Skill>
                        {
                            new Skill { Id = "s_1", Name = "Metrics Module", IsPrimary = true, Percent = 90 },
                            new Skill { Id = "s_2", Name = "GXP Module", IsPrimary = true, Percent = 85 },
                            new Skill { Id = "s_3", Name = "NABSIC Rules", IsPrimary = true, Percent = 85 },
                            new Skill { Id = "s_4", Name = "Shared Functions", IsPrimary = true, Percent = 80 },
                            new Skill { Id = "s_5", Name = "EHS Management", IsPrimary = false, Percent = 75 },
                            new Skill { Id = "s_6", Name = "Incident Management", IsPrimary = false, Percent = 85 },
                            new Skill { Id = "s_7", Name = "Risk Management", IsPrimary = false, Percent = 80 },
                            new Skill { Id = "s_8", Name = "Proton Lifecycle Management Tool", IsPrimary = false, Percent = 80 }
                        }
                    },
                    new SkillGroup
                    {
                        Id = "sg_2",
                        Category = "Development",
                        Skills = new List<Skill>
                        {
                            new Skill { Id = "s_9", Name = "ADO.NET MVC", IsPrimary = true, Percent = 85 },
                            new Skill { Id = "s_10", Name = "C#", IsPrimary = true, Percent = 85 },
                            new Skill { Id = "s_11", Name = "SQL", IsPrimary = true, Percent = 80 },
                            new Skill { Id = "s_12", Name = "NABSIC", IsPrimary = true, Percent = 85 },
                            new Skill { Id = "s_13", Name = "JavaScript", IsPrimary = false, Percent = 80 },
                            new Skill { Id = "s_14", Name = "POSTMAN", IsPrimary = false, Percent = 80 },
                            new Skill { Id = "s_15", Name = "HTML / CSS", IsPrimary = false, Percent = 85 }
                        }
                    },
                    new SkillGroup
                    {
                        Id = "sg_3",
                        Category = "Upskilling",
                        Skills = new List<Skill>
                        {
                            new Skill { Id = "s_16", Name = "Azure", IsPrimary = true, Percent = 70 },
                            new Skill { Id = "s_17", Name = "Angular", IsPrimary = true, Percent = 70 }
                        }
                    },
                    new SkillGroup
                    {
                        Id = "sg_4",
                        Category = "Domain & Process",
                        Skills = new List<Skill>
                        {
                            new Skill { Id = "s_18", Name = "Pharmaceutical Domain", IsPrimary = false, Percent = 85 },
                            new Skill { Id = "s_19", Name = "SDLC", IsPrimary = true, Percent = 85 },
                            new Skill { Id = "s_20", Name = "UAT Support", IsPrimary = false, Percent = 80 },
                            new Skill { Id = "s_21", Name = "Production Support", IsPrimary = false, Percent = 85 },
                            new Skill { Id = "s_22", Name = "Business Analysis", IsPrimary = false, Percent = 75 }
                        }
                    }
                },
                Projects = new List<Project>
                {
                    new Project
                    {
                        Id = "proj_1",
                        Title = "Enablon Metrics Configuration",
                        Description = "End-to-end configuration and support of the Metrics module for two pharmaceutical clients, including NABSIC rule logic building, production issue resolution, and UAT collaboration.",
                        Technologies = new List<string> { "Enablon", "NABSIC", "Metrics Module", "Proton" }
                    },
                    new Project
                    {
                        Id = "proj_2",
                        Title = "Production Issue Analysis",
                        Description = "Systematic root-cause analysis and resolution of production issues in the Enablon platform, coordinating with functional and business teams to minimise downtime.",
                        Technologies = new List<string> { "Enablon", "Incident Management", "Risk Management" }
                    },
                    new Project
                    {
                        Id = "proj_3",
                        Title = ".NET Internship Project",
                        Description = "Developed web application modules during internship using .NET Framework and JavaScript, applying enterprise development best practices.",
                        Technologies = new List<string> { ".NET Framework", "JavaScript", "ASP.NET", "HTML / CSS" }
                    }
                },
                Educations = new List<Education>
                {
                    new Education
                    {
                        Id = "edu_1",
                        Degree = "MCA",
                        Institution = "IEM",
                        Year = "2021–2023"
                    },
                    new Education
                    {
                        Id = "edu_2",
                        Degree = "BSc Computer Science",
                        Institution = "Midnapore College",
                        Year = "2018–2021"
                    }
                },
                Certifications = new List<Certification>
                {
                    new Certification
                    {
                        Id = "cert_1",
                        Name = "Database Management System",
                        Issuer = "NPTEL",
                        Year = "2022",
                        CertificateUrl = "https://archive.nptel.ac.in/noc/Ecertificate/?q=NPTEL22CS51S33750500NPTEL2201053954"
                    },
                    new Certification
                    {
                        Id = "cert_2",
                        Name = "Web Development with HTML,CSS and JS",
                        Issuer = "Coursera",
                        Year = "2022",
                        CertificateUrl = "https://www.coursera.org/account/accomplishments/certificate/8FQ55JT76TVH"
                    }
                }
            };
        }
    }
}
