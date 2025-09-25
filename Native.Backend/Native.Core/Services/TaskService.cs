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
        var created = await _taskRepository.AddAsync(task, cancellationToken);
        await _taskRepository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public Task<TaskItem?> GetTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
        => _taskRepository.GetByIdAsync(taskId, cancellationToken);

    public Task<IEnumerable<TaskItem>> GetTasksAsync(Guid projectId, CancellationToken cancellationToken = default)
        => _taskRepository.GetByProjectAsync(projectId, cancellationToken);

    public async Task UpdateTaskStatusAsync(Guid taskId, string status, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(taskId, cancellationToken)
                   ?? throw new KeyNotFoundException($"Task {taskId} not found");
        task.Status = status;
        await _taskRepository.SaveChangesAsync(cancellationToken);
    }
}
