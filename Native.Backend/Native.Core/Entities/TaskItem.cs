using System;
using System.Collections.Generic;

namespace Native.Core.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = default!;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Todo";
    public string Priority { get; set; } = "Normal";
    public Guid? AssigneeId { get; set; }
    public DateTime? DueAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
}
