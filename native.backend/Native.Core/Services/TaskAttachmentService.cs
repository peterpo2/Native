using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Core.Services;

public class TaskAttachmentService : ITaskAttachmentService
{
    private readonly ITaskAttachmentRepository _repository;

    public TaskAttachmentService(ITaskAttachmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<TaskAttachment> CreateAsync(TaskAttachment attachment, Guid requesterId, CancellationToken cancellationToken = default)
    {
        attachment.LinkedById = requesterId;
        var created = await _repository.AddAsync(attachment, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public Task<IEnumerable<TaskAttachment>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
        => _repository.GetByTaskAsync(taskId, cancellationToken);

    public async Task DeleteAsync(
        Guid taskId,
        Guid attachmentId,
        Guid requesterId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var attachment = await _repository.GetByIdAsync(attachmentId, cancellationToken)
                         ?? throw new KeyNotFoundException($"Attachment {attachmentId} not found");
        if (attachment.TaskId != taskId)
        {
            throw new InvalidOperationException("Attachment does not belong to the provided task");
        }

        if (!isAdmin && attachment.LinkedById != requesterId)
        {
            throw new UnauthorizedAccessException("You can only remove attachments you linked");
        }
        await _repository.RemoveAsync(attachment, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
    }
}
