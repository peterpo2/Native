using System;

using Native.Core.Interfaces;

namespace Native.Core.Entities;

public class IntegrationConnection : ISoftDeletable
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? OrganizationId { get; set; }
    public string Provider { get; set; } = default!;
    public string AccessToken { get; set; } = default!;
    public string? RefreshToken { get; set; }
    public string? AccountId { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}
