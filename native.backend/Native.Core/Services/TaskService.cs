using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Core.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;

    public TaskService(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<TaskItem> CreateTaskAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        if (task.OwnerId == Guid.Empty)
        {
            throw new ArgumentException("OwnerId is required", nameof(task));
        }

        task.Status = string.IsNullOrWhiteSpace(task.Status) ? "Todo" : task.Status;
        task.Priority = string.IsNullOrWhiteSpace(task.Priority) ? "Normal" : task.Priority;
        var created = await _taskRepository.AddAsync(task, cancellationToken);
        await _taskRepository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public Task<TaskItem?> GetTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
        => _taskRepository.GetByIdAsync(taskId, cancellationToken);

    public Task<IEnumerable<TaskItem>> GetTasksAsync(
        Guid projectId,
        string? status = null,
        Guid? assigneeId = null,
        DateTime? dueBefore = null,
        CancellationToken cancellationToken = default)
        => _taskRepository.GetByProjectAsync(projectId, status, assigneeId, dueBefore, cancellationToken);

    public Task<IEnumerable<TaskItem>> GetTasksForUserAsync(
        Guid ownerId,
        string? status = null,
        DateTime? dueBefore = null,
        CancellationToken cancellationToken = default)
        => _taskRepository.GetByOwnerAsync(ownerId, status, dueBefore, cancellationToken);

    public Task<IEnumerable<TaskItem>> SearchTasksAsync(Guid orgId, string query, Guid? projectId = null, CancellationToken cancellationToken = default)
        => _taskRepository.SearchAsync(orgId, query, projectId, cancellationToken);

    public async Task UpdateTaskStatusAsync(
        Guid taskId,
        Guid requesterId,
        string status,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            throw new ArgumentException("Status cannot be empty", nameof(status));
        }

        var task = await _taskRepository.GetByIdAsync(taskId, cancellationToken)
                   ?? throw new KeyNotFoundException($"Task {taskId} not found");

        if (!isAdmin && task.OwnerId != requesterId)
        {
            throw new UnauthorizedAccessException("You can only update tasks you created");
        }

        task.Status = status;
        task.CompletedAt = status.Equals("Done", StringComparison.OrdinalIgnoreCase)
            ? DateTime.UtcNow
            : null;
        await _taskRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateTaskDetailsAsync(
        Guid taskId,
        Guid requesterId,
        string? title,
        string? description,
        string? priority,
        DateTime? dueAt,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(taskId, cancellationToken)
                   ?? throw new KeyNotFoundException($"Task {taskId} not found");

        if (!isAdmin && task.OwnerId != requesterId)
        {
            throw new UnauthorizedAccessException("You can only update tasks you created");
        }

        if (!string.IsNullOrWhiteSpace(title))
        {
            task.Title = title!;
        }

        if (description is not null)
        {
            task.Description = description;
        }

        if (!string.IsNullOrWhiteSpace(priority))
        {
            task.Priority = priority!;
        }

        task.DueAt = dueAt;

        await _taskRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteTaskAsync(Guid taskId, Guid requesterId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(taskId, cancellationToken)
                   ?? throw new KeyNotFoundException($"Task {taskId} not found");

        if (!isAdmin && task.OwnerId != requesterId)
        {
            throw new UnauthorizedAccessException("You can only delete tasks you created");
        }

        await _taskRepository.RemoveAsync(task, cancellationToken);
        await _taskRepository.SaveChangesAsync(cancellationToken);
    }
}
