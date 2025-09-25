using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ITaskService
{
    Task<TaskItem> CreateTaskAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskItem>> GetTasksAsync(
        Guid projectId,
        string? status = null,
        Guid? assigneeId = null,
        DateTime? dueBefore = null,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<TaskItem>> GetTasksForUserAsync(
        Guid ownerId,
        string? status = null,
        DateTime? dueBefore = null,
        CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskItem>> SearchTasksAsync(Guid orgId, string query, Guid? projectId = null, CancellationToken cancellationToken = default);
    Task UpdateTaskStatusAsync(Guid taskId, Guid requesterId, string status, bool isAdmin, CancellationToken cancellationToken = default);
    Task UpdateTaskDetailsAsync(
        Guid taskId,
        Guid requesterId,
        string? title,
        string? description,
        string? priority,
        DateTime? dueAt,
        bool isAdmin,
        CancellationToken cancellationToken = default);
    Task DeleteTaskAsync(Guid taskId, Guid requesterId, bool isAdmin, CancellationToken cancellationToken = default);
}
