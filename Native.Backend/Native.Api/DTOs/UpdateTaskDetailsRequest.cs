using System;

namespace Native.Api.DTOs;

public record UpdateTaskDetailsRequest(
    string? Title,
    string? Description,
    string? Priority,
    DateTime? DueAt);
