using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ITaskRepository : IGenericRepository<TaskItem>
{
    Task<IEnumerable<TaskItem>> GetByProjectAsync(Guid projectId, CancellationToken cancellationToken = default);
}
