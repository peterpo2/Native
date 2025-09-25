using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Native.Api.DTOs;
using Native.Api.Hubs;
using Native.Api.Extensions;
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

    [HttpGet("mine")]
    public async Task<IActionResult> GetMyTasks(
        [FromQuery] string? status,
        [FromQuery] DateTime? dueBefore,
        CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetTasksForUserAsync(User.GetUserId(), status, dueBefore, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{projectId:guid}")]
    public async Task<IActionResult> GetTasks(
        Guid projectId,
        [FromQuery] string? status,
        [FromQuery] Guid? assigneeId,
        [FromQuery] DateTime? dueBefore,
        CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetTasksAsync(projectId, status, assigneeId, dueBefore, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{projectId:guid}/search")]
    public async Task<IActionResult> Search(Guid projectId, [FromQuery] Guid orgId, [FromQuery] string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Query cannot be empty");
        }

        if (orgId == Guid.Empty)
        {
            return BadRequest("orgId is required");
        }

        var tasks = await _taskService.SearchTasksAsync(orgId, query, projectId, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("item/{taskId:guid}")]
    public async Task<IActionResult> GetTask(Guid taskId, CancellationToken cancellationToken)
    {
        var task = await _taskService.GetTaskAsync(taskId, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        return Ok(task);
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
            DueAt = request.DueAt,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Todo" : request.Status!,
            Priority = string.IsNullOrWhiteSpace(request.Priority) ? "Normal" : request.Priority!,
            OwnerId = User.GetUserId()
        }, cancellationToken);

        if (created.ProjectId.HasValue)
        {
            await _hubContext.Clients.Group(created.ProjectId.Value.ToString()).SendAsync("taskCreated", created, cancellationToken);
        }

        return CreatedAtAction(nameof(GetTask), new { taskId = created.Id }, created);
    }

    [HttpPatch("{taskId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid taskId, UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _taskService.UpdateTaskStatusAsync(
                taskId,
                User.GetUserId(),
                request.Status,
                User.IsAdmin(),
                cancellationToken);
            await _hubContext.Clients.All.SendAsync("taskUpdated", new { taskId, request.Status }, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPatch("{taskId:guid}")]
    public async Task<IActionResult> UpdateTask(Guid taskId, UpdateTaskDetailsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _taskService.UpdateTaskDetailsAsync(
                taskId,
                User.GetUserId(),
                request.Title,
                request.Description,
                request.Priority,
                request.DueAt,
                User.IsAdmin(),
                cancellationToken);
            await _hubContext.Clients.All.SendAsync("taskUpdated", new { taskId }, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{taskId:guid}")]
    public async Task<IActionResult> DeleteTask(Guid taskId, CancellationToken cancellationToken)
    {
        try
        {
            await _taskService.DeleteTaskAsync(taskId, User.GetUserId(), User.IsAdmin(), cancellationToken);
            await _hubContext.Clients.All.SendAsync("taskDeleted", new { taskId }, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
