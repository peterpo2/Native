using System;

namespace Native.Api.DTOs;

public record CreateTaskRequest(
    Guid ProjectId,
    string Title,
    string? Description,
    Guid? AssigneeId,
    DateTime? DueAt,
    string? Status,
    string? Priority);
