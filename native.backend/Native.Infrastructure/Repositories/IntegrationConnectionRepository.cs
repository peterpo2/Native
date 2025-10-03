using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Infrastructure.Data;

namespace Native.Infrastructure.Repositories;

public class IntegrationConnectionRepository : GenericRepository<IntegrationConnection>, IIntegrationConnectionRepository
{
    public IntegrationConnectionRepository(NativeDbContext context) : base(context)
    {
    }

    public Task<IntegrationConnection?> GetAsync(Guid userId, string provider, CancellationToken cancellationToken = default)
        => DbSet.AsNoTracking().FirstOrDefaultAsync(
            connection => connection.UserId == userId && connection.Provider == provider,
            cancellationToken);

    public async Task<IntegrationConnection> UpsertAsync(IntegrationConnection connection, CancellationToken cancellationToken = default)
    {
        var existing = await Context.IntegrationConnections
            .FirstOrDefaultAsync(
                c => c.UserId == connection.UserId && c.Provider == connection.Provider,
                cancellationToken);

        if (existing is null)
        {
            await DbSet.AddAsync(connection, cancellationToken);
            await Context.SaveChangesAsync(cancellationToken);
            return connection;
        }

        existing.AccessToken = connection.AccessToken;
        existing.RefreshToken = connection.RefreshToken;
        existing.AccountId = connection.AccountId;
        existing.ExpiresAt = connection.ExpiresAt;
        existing.OrganizationId = connection.OrganizationId;
        existing.ConnectedAt = connection.ConnectedAt;

        await Context.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task RemoveAsync(Guid userId, string provider, CancellationToken cancellationToken = default)
    {
        var existing = await Context.IntegrationConnections
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Provider == provider, cancellationToken);

        if (existing is null)
        {
            return;
        }

        Context.IntegrationConnections.Remove(existing);
        await Context.SaveChangesAsync(cancellationToken);
    }
}
