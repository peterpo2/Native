using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Native.Api.DTOs;
using Native.Api.Hubs;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IHubContext<TaskHub> _hubContext;

    public TaskController(ITaskService taskService, IHubContext<TaskHub> hubContext)
    {
        _taskService = taskService;
        _hubContext = hubContext;
    }

    [HttpGet("{projectId:guid}")]
    public async Task<IActionResult> GetTasks(Guid projectId, CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetTasksAsync(projectId, cancellationToken);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var created = await _taskService.CreateTaskAsync(new TaskItem
        {
            ProjectId = request.ProjectId,
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            AssigneeId = request.AssigneeId,
            DueAt = request.DueAt
        }, cancellationToken);

        await _hubContext.Clients.Group(created.ProjectId.ToString()).SendAsync("taskCreated", created, cancellationToken);
        return CreatedAtAction(nameof(GetTasks), new { projectId = created.ProjectId }, created);
    }

    [HttpPatch("{taskId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid taskId, UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        await _taskService.UpdateTaskStatusAsync(taskId, request.Status, cancellationToken);
        await _hubContext.Clients.All.SendAsync("taskUpdated", new { taskId, request.Status }, cancellationToken);
        return NoContent();
    }
}
