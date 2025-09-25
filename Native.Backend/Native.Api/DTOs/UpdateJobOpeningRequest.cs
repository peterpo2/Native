namespace Native.Api.DTOs;

public record UpdateJobOpeningRequest(
    string Title,
    string? Department,
    string? Location,
    string? Description,
    bool IsPublished);
