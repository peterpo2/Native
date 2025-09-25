using System;

namespace Native.Api.DTOs;

public record CreateJobOpeningRequest(
    Guid OrgId,
    string Title,
    string? Department,
    string? Location,
    string? Description,
    bool IsPublished);
