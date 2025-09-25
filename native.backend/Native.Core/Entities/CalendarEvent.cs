using System;

namespace Native.Core.Entities;

public class CalendarEvent
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string Provider { get; set; } = "Google";
    public string ExternalEventId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public bool IsAllDay { get; set; }
}
