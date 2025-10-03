using System;
using System.Text.Json.Serialization;
using Native.Core.Interfaces;

namespace Native.Core.Entities;

public class CalendarShare : ISoftDeletable
{
    public Guid CalendarId { get; set; }
    public Guid UserId { get; set; }

    [JsonIgnore]
    public CalendarBoard? Calendar { get; set; }
    public bool IsDeleted { get; set; }
}
