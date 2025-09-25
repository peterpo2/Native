using System;

namespace Native.Api.DTOs;

public record AuthResponse(string Token, DateTime ExpiresAt, Guid UserId, string Email, string FullName, string Role);
