namespace Native.Api.DTOs;

public record UpdateUserRequest(
    string? FullName,
    string? Role,
    bool? TwoFactorEnabled);
