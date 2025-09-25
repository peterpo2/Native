using Microsoft.EntityFrameworkCore;
using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Infrastructure.Data;

namespace Native.Infrastructure.Repositories;

public class TaskRepository : GenericRepository<TaskItem>, ITaskRepository
{
    public TaskRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TaskItem>> GetByProjectAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
