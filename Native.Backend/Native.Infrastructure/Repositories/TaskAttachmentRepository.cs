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

public class TaskAttachmentRepository : GenericRepository<TaskAttachment>, ITaskAttachmentRepository
{
    public TaskAttachmentRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TaskAttachment>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(a => a.TaskId == taskId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
