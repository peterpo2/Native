using System;

namespace Native.Api.DTOs;

public record CalendarEventRequest(
    Guid? Id,
    Guid CalendarId,
    Guid? TaskId,
    string Title,
    string? Location,
    DateTime Start,
    DateTime End,
    bool IsAllDay,
    string? Provider,
    string? ExternalEventId);
