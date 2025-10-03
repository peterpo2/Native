using System;

using Native.Core.Interfaces;

namespace Native.Core.Entities;

public class TaskAttachment : ISoftDeletable
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string FileName { get; set; } = default!;
    public string Url { get; set; } = default!;
    public string Provider { get; set; } = "dropbox";
    public Guid? LinkedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}
