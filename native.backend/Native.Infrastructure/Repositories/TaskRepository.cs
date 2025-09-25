using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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

    public async Task<IEnumerable<TaskItem>> GetByProjectAsync(
        Guid projectId,
        string? status = null,
        Guid? assigneeId = null,
        DateTime? dueBefore = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(t => t.ProjectId == projectId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }

        if (assigneeId.HasValue)
        {
            query = query.Where(t => t.AssigneeId == assigneeId.Value);
        }

        if (dueBefore.HasValue)
        {
            query = query.Where(t => t.DueAt <= dueBefore);
        }

        return await query
            .OrderByDescending(t => t.Priority == "Urgent")
            .ThenByDescending(t => t.Priority == "High")
            .ThenByDescending(t => t.Priority == "Normal")
            .ThenBy(t => t.DueAt)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TaskItem>> SearchAsync(Guid orgId, string query, Guid? projectId = null, CancellationToken cancellationToken = default)
    {
        var search = Context.Tasks.AsNoTracking()
            .Join(
                Context.Projects.AsNoTracking(),
                task => task.ProjectId,
                project => project.Id,
                (task, project) => new { task, project })
            .Where(x => x.project.OrgId == orgId &&
                        (EF.Functions.Like(x.task.Title, $"%{query}%") ||
                         EF.Functions.Like(x.task.Description, $"%{query}%")));

        if (projectId.HasValue)
        {
            search = search.Where(x => x.task.ProjectId == projectId.Value);
        }

        return await search
            .OrderByDescending(x => x.task.CreatedAt)
            .Select(x => x.task)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TaskItem>> GetByOwnerAsync(
        Guid ownerId,
        string? status = null,
        DateTime? dueBefore = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(t => t.OwnerId == ownerId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }

        if (dueBefore.HasValue)
        {
            query = query.Where(t => t.DueAt <= dueBefore.Value);
        }

        return await query
            .OrderByDescending(t => t.Priority == "Urgent")
            .ThenByDescending(t => t.Priority == "High")
            .ThenByDescending(t => t.Priority == "Normal")
            .ThenBy(t => t.DueAt ?? DateTime.MaxValue)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
