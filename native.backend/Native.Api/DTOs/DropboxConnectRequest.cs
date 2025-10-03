using System;

namespace Native.Api.DTOs;

public record DropboxConnectRequest(
    string AccessToken,
    string? RefreshToken,
    DateTime? ExpiresAt,
    string? AccountId);
