using System;

namespace Native.Api.DTOs;

public record CalendarEventRequest(
    Guid? Id,
    Guid TaskId,
    string Provider,
    string ExternalEventId,
    string Title,
    string? Location,
    DateTime Start,
    DateTime End,
    bool IsAllDay);
