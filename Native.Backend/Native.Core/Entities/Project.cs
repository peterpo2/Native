using System;
using System.Collections.Generic;

namespace Native.Core.Entities;

public class Project
{
    public Guid Id { get; set; }
    public Guid OrgId { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string Color { get; set; } = "#7c3aed";
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
