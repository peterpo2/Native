using System;
using System.Collections.Generic;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ITaskAttachmentRepository : IGenericRepository<TaskAttachment>
{
    Task<IEnumerable<TaskAttachment>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
}
