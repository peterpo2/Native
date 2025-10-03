using System;

namespace Native.Api.DTOs;

public record DropboxStatusResponse(
    bool IsConfigured,
    bool IsConnected,
    string? AuthorizationUrl,
    string? State,
    DateTime? ConnectedAt,
    string? AccountId);
