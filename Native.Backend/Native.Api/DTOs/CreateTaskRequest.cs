namespace Native.Api.DTOs;

public record CreateTaskRequest(Guid ProjectId, string Title, string? Description, Guid? AssigneeId, DateTime? DueAt);
