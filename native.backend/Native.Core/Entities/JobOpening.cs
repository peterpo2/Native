using System;
using System.Collections.Generic;

namespace Native.Core.Entities;

public class JobOpening
{
    public Guid Id { get; set; }
    public Guid OrgId { get; set; }
    public string Title { get; set; } = default!;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
