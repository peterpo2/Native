using System;

namespace Native.Api.DTOs;

public record CreateUserRequest(
    string Email,
    string Password,
    string FullName,
    string? Role,
    Guid? OrganizationId);
