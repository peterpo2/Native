using System;
using System.Text.Json.Serialization;

namespace Native.Core.Entities;

public class CalendarShare
{
    public Guid CalendarId { get; set; }
    public Guid UserId { get; set; }

    [JsonIgnore]
    public CalendarBoard? Calendar { get; set; }
}
