using Microsoft.EntityFrameworkCore;
using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Infrastructure.Data;

namespace Native.Infrastructure.Repositories;

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
    public ProjectRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Project>> GetByOrganizationAsync(Guid orgId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(p => p.OrgId == orgId)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }
}
