using System;

namespace Native.Core.Models;

public record IntegrationConnectionInput(
    string Provider,
    string AccessToken,
    string? RefreshToken,
    DateTime? ExpiresAt,
    string? AccountId,
    Guid? OrganizationId);
