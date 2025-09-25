using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Native.Api.DTOs;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/tasks/{taskId:guid}/attachments")]
[Authorize]
public class TaskAttachmentsController : ControllerBase
{
    private readonly ITaskAttachmentService _attachmentService;

    public TaskAttachmentsController(ITaskAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(Guid taskId, CancellationToken cancellationToken)
    {
        var attachments = await _attachmentService.GetByTaskAsync(taskId, cancellationToken);
        return Ok(attachments);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid taskId, CreateTaskAttachmentRequest request, CancellationToken cancellationToken)
    {
        var attachment = await _attachmentService.CreateAsync(new TaskAttachment
        {
            TaskId = taskId,
            FileName = request.FileName,
            Url = request.Url,
            Provider = string.IsNullOrWhiteSpace(request.Provider) ? "dropbox" : request.Provider!,
            LinkedById = request.LinkedById
        }, cancellationToken);

        return CreatedAtAction(nameof(Get), new { taskId }, attachment);
    }

    [HttpDelete("{attachmentId:guid}")]
    public async Task<IActionResult> Delete(Guid taskId, Guid attachmentId, CancellationToken cancellationToken)
    {
        try
        {
            await _attachmentService.DeleteAsync(taskId, attachmentId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
