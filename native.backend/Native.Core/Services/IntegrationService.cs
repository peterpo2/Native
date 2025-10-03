using System;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Core.Models;

namespace Native.Core.Services;

public class IntegrationService : IIntegrationService
{
    private readonly IIntegrationConnectionRepository _connectionRepository;

    public IntegrationService(IIntegrationConnectionRepository connectionRepository)
    {
        _connectionRepository = connectionRepository;
    }

    public Task<IntegrationConnection?> GetConnectionAsync(Guid userId, string provider, CancellationToken cancellationToken = default)
        => _connectionRepository.GetAsync(userId, Normalize(provider), cancellationToken);

    public Task<IntegrationConnection> SaveConnectionAsync(Guid userId, IntegrationConnectionInput connection, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(connection.Provider))
        {
            throw new ArgumentException("Provider is required", nameof(connection));
        }

        var entity = new IntegrationConnection
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OrganizationId = connection.OrganizationId,
            Provider = Normalize(connection.Provider),
            AccessToken = connection.AccessToken,
            RefreshToken = connection.RefreshToken,
            AccountId = connection.AccountId,
            ExpiresAt = connection.ExpiresAt,
            ConnectedAt = DateTime.UtcNow
        };

        return _connectionRepository.UpsertAsync(entity, cancellationToken);
    }

    public Task RemoveConnectionAsync(Guid userId, string provider, CancellationToken cancellationToken = default)
        => _connectionRepository.RemoveAsync(userId, Normalize(provider), cancellationToken);

    private static string Normalize(string provider)
        => provider.Trim().ToLowerInvariant();
}
