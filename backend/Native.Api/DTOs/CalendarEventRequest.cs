namespace Native.Api.DTOs;

public record CalendarEventRequest(Guid? Id, Guid TaskId, string Provider, string ExternalEventId, DateTime Start, DateTime End);
