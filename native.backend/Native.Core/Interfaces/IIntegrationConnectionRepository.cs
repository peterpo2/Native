using System;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IIntegrationConnectionRepository
{
    Task<IntegrationConnection?> GetAsync(Guid userId, string provider, CancellationToken cancellationToken = default);
    Task<IntegrationConnection> UpsertAsync(IntegrationConnection connection, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid userId, string provider, CancellationToken cancellationToken = default);
}
