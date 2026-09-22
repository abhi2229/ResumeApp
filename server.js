const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'wwwroot', 'resumeData.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'ResumeApp_Admin_Secret_Key_2026',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 4 * 60 * 60 * 1000 }
}));

// Serve static files from wwwroot
app.use(express.static(path.join(__dirname, 'wwwroot')));

// Default Seed Data Generator
function getSeedData() {
  const now = new Date().toUTCString();
  return {
    LastUpdated: now,
    Profile: {
      Name: "Abhishek Maiti",
      Initials: "AM",
      Title: "Enablon Consultant · Cognizant",
      Bio: "Enablon Consultant specializing in Metrics and NABSIC logic, with hands-on experience supporting pharmaceutical clients in production environments.\nFocused on resolving complex aggregation and consolidation issues, improving data accuracy, and delivering reliable KPI reporting.\nCurrently expanding into Azure and Angular to build end-to-end scalable solutions.",
      Email: "maity2229@gmail.com",
      Phone: "+91 7602968387",
      Location: "Hyderabad, Telangana, India",
      LinkedIn: "https://www.linkedin.com/in/abhishek-maiti-328614181"
    },
    Experiences: [
      {
        Id: "exp_1",
        Company: "Cognizant",
        EmploymentType: "Full-time · HYD",
        Role: "Programmer Analyst",
        Period: "Sep 2025 – Present",
        Bullets: [
          "Providing Enablon platform support and configuration for pharmaceutical clients, focusing on the Metrics and GXP modules.",
          "Analysing and resolving production issues, performing root-cause analysis and coordinating fixes with functional teams.",
          "Building and validating NABSIC rules to address complex business requirements and ensure data accuracy.",
          "Created customized KPIs using Business Analyzer Templates (BAT) with advanced aggregation logic (SUM, AVG) and consolidation algorithms.",
          "Resolved consolidation issues involving monthly vs quarterly calculation variance and NULL vs 0 value handling in data aggregation.",
          "Supporting UAT cycles by collaborating closely with business stakeholders to verify configurations meet requirements.",
          "Working with Shared Functions, Incident Management and Risk Management modules in Enablon.",
          "Following SDLC best practices throughout the development and support lifecycle."
        ]
      },
      {
        Id: "exp_2",
        Company: "Cognizant",
        EmploymentType: "Full-time · HYD",
        Role: "Programmer Analyst Trainee",
        Period: "Sep 2024 – Sep 2025",
        Bullets: [
          "Configured and maintained Enablon Metrics module for pharmaceutical domain clients.",
          "Assisted in logic building for NABSIC rules and supported production issue triage.",
          "Collaborated with functional teams on platform configuration and business requirement mapping.",
          "Gained working knowledge of Enablon's Incident Management and Risk Management modules.",
          "Worked on documentation and maintained documentation in the PROTON Life Cycle Management tool."
        ]
      },
      {
        Id: "exp_3",
        Company: "Cognizant",
        EmploymentType: "Internship · HYD",
        Role: "Programmer Analyst Trainee",
        Period: "Dec 2023 – Apr 2024",
        Bullets: [
          "Trained in .NET Framework fundamentals and applied skills in hands-on development tasks.",
          "Worked with JavaScript and web technologies as part of the internship curriculum.",
          "Gained exposure to enterprise software development practices and Agile workflows."
        ]
      }
    ],
    SkillGroups: [
      {
        Id: "sg_1",
        Category: "Enablon Platform",
        Skills: [
          { Id: "s_1", Name: "Metrics Module", IsPrimary: true, Percent: 90 },
          { Id: "s_2", Name: "GXP Module", IsPrimary: true, Percent: 85 },
          { Id: "s_3", Name: "NABSIC Rules", IsPrimary: true, Percent: 85 },
          { Id: "s_4", Name: "Shared Functions", IsPrimary: true, Percent: 80 },
          { Id: "s_5", Name: "EHS Management", IsPrimary: false, Percent: 75 },
          { Id: "s_6", Name: "Incident Management", IsPrimary: false, Percent: 85 },
          { Id: "s_7", Name: "Risk Management", IsPrimary: false, Percent: 80 },
          { Id: "s_8", Name: "Proton Lifecycle Management Tool", IsPrimary: false, Percent: 80 }
        ]
      },
      {
        Id: "sg_2",
        Category: "Development",
        Skills: [
          { Id: "s_9", Name: "ADO.NET MVC", IsPrimary: true, Percent: 85 },
          { Id: "s_10", Name: "C#", IsPrimary: true, Percent: 85 },
          { Id: "s_11", Name: "SQL", IsPrimary: true, Percent: 80 },
          { Id: "s_12", Name: "NABSIC", IsPrimary: true, Percent: 85 },
          { Id: "s_13", Name: "JavaScript", IsPrimary: false, Percent: 80 },
          { Id: "s_14", Name: "POSTMAN", IsPrimary: false, Percent: 80 },
          { Id: "s_15", Name: "HTML / CSS", IsPrimary: false, Percent: 85 }
        ]
      },
      {
        Id: "sg_3",
        Category: "Upskilling",
        Skills: [
          { Id: "s_16", Name: "Azure", IsPrimary: true, Percent: 70 },
          { Id: "s_17", Name: "Angular", IsPrimary: true, Percent: 70 }
        ]
      },
      {
        Id: "sg_4",
        Category: "Domain & Process",
        Skills: [
          { Id: "s_18", Name: "Pharmaceutical Domain", IsPrimary: false, Percent: 85 },
          { Id: "s_19", Name: "SDLC", IsPrimary: true, Percent: 85 },
          { Id: "s_20", Name: "UAT Support", IsPrimary: false, Percent: 80 },
          { Id: "s_21", Name: "Production Support", IsPrimary: false, Percent: 85 },
          { Id: "s_22", Name: "Business Analysis", IsPrimary: false, Percent: 75 }
        ]
      }
    ],
    Projects: [
      {
        Id: "proj_1",
        Title: "Enablon Metrics Configuration",
        Description: "End-to-end configuration and support of the Metrics module for two pharmaceutical clients, including NABSIC rule logic building, production issue resolution, and UAT collaboration.",
        Technologies: ["Enablon", "NABSIC", "Metrics Module", "Proton"]
      },
      {
        Id: "proj_2",
        Title: "Production Issue Analysis",
        Description: "Systematic root-cause analysis and resolution of production issues in the Enablon platform, coordinating with functional and business teams to minimise downtime.",
        Technologies: ["Enablon", "Incident Management", "Risk Management"]
      },
      {
        Id: "proj_3",
        Title: ".NET Internship Project",
        Description: "Developed web application modules during internship using .NET Framework and JavaScript, applying enterprise development best practices.",
        Technologies: [".NET Framework", "JavaScript", "ASP.NET", "HTML / CSS"]
      }
    ],
    Educations: [
      { Id: "edu_1", Degree: "MCA", Institution: "IEM", Year: "2021–2023" },
      { Id: "edu_2", Degree: "BSc Computer Science", Institution: "Midnapore College", Year: "2018–2021" }
    ],
    Certifications: [
      {
        Id: "cert_1",
        Name: "Database Management System",
        Issuer: "NPTEL",
        Year: "2022",
        CertificateUrl: "https://archive.nptel.ac.in/noc/Ecertificate/?q=NPTEL22CS51S33750500NPTEL2201053954"
      },
      {
        Id: "cert_2",
        Name: "Web Development with HTML,CSS and JS",
        Issuer: "Coursera",
        Year: "2022",
        CertificateUrl: "https://www.coursera.org/account/accomplishments/certificate/8FQ55JT76TVH"
      }
    ]
  };
}

function getResumeData() {
  if (!fs.existsSync(DATA_FILE)) {
    const seed = getSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  try {
    const json = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(json);
  } catch (err) {
    return getSeedData();
  }
}

// API Endpoints
app.get('/api/resume', (req, res) => {
  res.json(getResumeData());
});

app.post('/Admin/Login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'admin' && password === 'Admin@Resume2026') {
    req.session.isAdmin = true;
    return res.json({ success: true, message: 'Login successful' });
  }
  res.json({ success: false, message: 'Invalid admin username or password' });
});

app.post('/Admin/Logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/Admin/Status', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

app.post('/Admin/UpdateData', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const payload = req.body;
  const now = new Date();
  const formattedDate = now.getUTCDate().toString().padStart(2, '0') + ' ' +
    now.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) + ' ' +
    now.getUTCFullYear() + ', ' +
    now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' }) + ' UTC';

  payload.LastUpdated = formattedDate;
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2));
  res.json({ success: true, lastUpdated: formattedDate, message: 'Updated successfully' });
});

app.listen(PORT, () => {
  console.log(`ResumeApp running at http://localhost:${PORT}`);
});
