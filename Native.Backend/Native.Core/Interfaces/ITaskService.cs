using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ITaskService
{
    Task<TaskItem> CreateTaskAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskItem>> GetTasksAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task UpdateTaskStatusAsync(Guid taskId, string status, CancellationToken cancellationToken = default);
}
