using System;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Models;

namespace Native.Core.Interfaces;

public interface IIntegrationService
{
    Task<IntegrationConnection?> GetConnectionAsync(Guid userId, string provider, CancellationToken cancellationToken = default);
    Task<IntegrationConnection> SaveConnectionAsync(Guid userId, IntegrationConnectionInput connection, CancellationToken cancellationToken = default);
    Task RemoveConnectionAsync(Guid userId, string provider, CancellationToken cancellationToken = default);
}
