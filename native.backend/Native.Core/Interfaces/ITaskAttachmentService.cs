using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ITaskAttachmentService
{
    Task<TaskAttachment> CreateAsync(TaskAttachment attachment, Guid requesterId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskAttachment>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid taskId, Guid attachmentId, Guid requesterId, bool isAdmin, CancellationToken cancellationToken = default);
}
