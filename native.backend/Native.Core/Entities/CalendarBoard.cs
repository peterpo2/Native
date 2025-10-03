using System;
using System.Collections.Generic;
using Native.Core.Interfaces;

namespace Native.Core.Entities;

public class CalendarBoard : ISoftDeletable
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public CalendarVisibility Visibility { get; set; } = CalendarVisibility.Private;
    public ICollection<CalendarEvent> Events { get; set; } = new List<CalendarEvent>();
    public ICollection<CalendarShare> SharedUsers { get; set; } = new List<CalendarShare>();
    public bool IsDeleted { get; set; }
}
