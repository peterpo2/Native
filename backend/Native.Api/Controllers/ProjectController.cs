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

    [HttpPost]
    public async Task<IActionResult> Create(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var created = await _projectService.CreateProjectAsync(new Project
        {
            OrgId = request.OrgId,
            Name = request.Name
        }, cancellationToken);

        return CreatedAtAction(nameof(GetProjects), new { orgId = created.OrgId }, created);
    }
}
