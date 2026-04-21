namespace ResumeApp.Models
{
    public class ResumeViewModel
    {
        public Profile Profile { get; set; } = new();
        public List<Experience> Experiences { get; set; } = new();
        public List<SkillGroup> SkillGroups { get; set; } = new();
        public List<Project> Projects { get; set; } = new();
        public List<Education> Educations { get; set; } = new();
        public List<Certification> Certifications { get; set; } = new();
    }

    public class Profile
    {
        public string Name { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string LinkedIn { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
    }

    public class Experience
    {
        public string Company { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public List<string> Bullets { get; set; } = new();
    }

    public class SkillGroup
    {
        public string Category { get; set; } = string.Empty;
        public List<Skill> Skills { get; set; } = new();
    }

    public class Skill
    {
        public string Name { get; set; } = string.Empty;
        public bool IsPrimary { get; set; } = false;
    }

    public class Project
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Technologies { get; set; } = new();
    }

    public class Education
    {
        public string Degree { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
    }

    public class Certification
    {
        public string Name { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string? CertificateUrl { get; set; }
    }
}
