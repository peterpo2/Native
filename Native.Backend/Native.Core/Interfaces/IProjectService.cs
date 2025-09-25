using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IProjectService
{
    Task<Project> CreateProjectAsync(Project project, CancellationToken cancellationToken = default);
    Task<IEnumerable<Project>> GetProjectsAsync(Guid orgId, CancellationToken cancellationToken = default);
    Task<Project?> GetProjectAsync(Guid projectId, CancellationToken cancellationToken = default);
}
