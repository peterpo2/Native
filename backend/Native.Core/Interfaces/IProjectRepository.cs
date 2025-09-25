using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IProjectRepository : IGenericRepository<Project>
{
    Task<IEnumerable<Project>> GetByOrganizationAsync(Guid orgId, CancellationToken cancellationToken = default);
}
