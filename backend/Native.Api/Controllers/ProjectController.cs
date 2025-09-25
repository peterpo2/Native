using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Native.Api.DTOs;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet("{orgId:guid}")]
    public async Task<IActionResult> GetProjects(Guid orgId, CancellationToken cancellationToken)
    {
        var projects = await _projectService.GetProjectsAsync(orgId, cancellationToken);
        return Ok(projects);
    }

    [HttpGet("item/{projectId:guid}")]
    public async Task<IActionResult> GetProject(Guid projectId, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetProjectAsync(projectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var created = await _projectService.CreateProjectAsync(new Project
        {
            OrgId = request.OrgId,
            Name = request.Name,
            Description = request.Description,
            Color = string.IsNullOrWhiteSpace(request.Color) ? "#7c3aed" : request.Color!
        }, cancellationToken);

        return CreatedAtAction(nameof(GetProject), new { projectId = created.Id }, created);
    }

    [HttpPatch("{projectId:guid}")]
    public async Task<IActionResult> Update(Guid projectId, CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var updated = await _projectService.UpdateProjectAsync(new Project
        {
            Id = projectId,
            OrgId = request.OrgId,
            Name = request.Name,
            Description = request.Description,
            Color = string.IsNullOrWhiteSpace(request.Color) ? "#7c3aed" : request.Color!
        }, cancellationToken);

        return Ok(updated);
    }
}
