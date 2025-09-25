using System;

namespace Native.Core.Models;

public record AuthResult(string Token, DateTime ExpiresAt, UserSummary User);

public record UserSummary(Guid Id, string Email, string FullName, string Role);
