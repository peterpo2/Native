using System;
using System.Collections.Generic;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ITaskAttachmentService
{
    Task<TaskAttachment> CreateAsync(TaskAttachment attachment, CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskAttachment>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid taskId, Guid attachmentId, CancellationToken cancellationToken = default);
}
