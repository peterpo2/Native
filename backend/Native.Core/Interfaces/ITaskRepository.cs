using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ITaskRepository : IGenericRepository<TaskItem>
{
    Task<IEnumerable<TaskItem>> GetByProjectAsync(
        Guid projectId,
        string? status = null,
        Guid? assigneeId = null,
        DateTime? dueBefore = null,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<TaskItem>> SearchAsync(Guid orgId, string query, Guid? projectId = null, CancellationToken cancellationToken = default);
}
