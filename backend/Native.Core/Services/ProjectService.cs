using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Core.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    public async Task<Project> CreateProjectAsync(Project project, CancellationToken cancellationToken = default)
    {
        var created = await _projectRepository.AddAsync(project, cancellationToken);
        await _projectRepository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public Task<Project?> GetProjectAsync(Guid projectId, CancellationToken cancellationToken = default)
        => _projectRepository.GetByIdAsync(projectId, cancellationToken);

    public Task<IEnumerable<Project>> GetProjectsAsync(Guid orgId, CancellationToken cancellationToken = default)
        => _projectRepository.GetByOrganizationAsync(orgId, cancellationToken);

    public async Task<Project> UpdateProjectAsync(Project project, CancellationToken cancellationToken = default)
    {
        var existing = await _projectRepository.GetByIdAsync(project.Id, cancellationToken)
                        ?? throw new KeyNotFoundException($"Project {project.Id} not found");

        existing.Name = project.Name;
        existing.Description = project.Description;
        existing.Color = project.Color;

        await _projectRepository.SaveChangesAsync(cancellationToken);
        return existing;
    }
}
