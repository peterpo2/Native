using System;

using Native.Core.Interfaces;

namespace Native.Core.Entities;

public class JobApplication : ISoftDeletable
{
    public Guid Id { get; set; }
    public Guid JobOpeningId { get; set; }
    public string CandidateName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Phone { get; set; }
    public string Stage { get; set; } = "Applied";
    public string? ResumeUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}
