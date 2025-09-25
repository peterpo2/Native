using System;

namespace Native.Api.DTOs;

public record UpdateUserRequest(
    string? FullName,
    string? Role,
    bool? TwoFactorEnabled,
    string? Email,
    string? Password,
    Guid? OrganizationId);
