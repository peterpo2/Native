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
public class CareersController : ControllerBase
{
    private readonly IJobOpeningService _jobOpeningService;
    private readonly IJobApplicationService _jobApplicationService;

    public CareersController(IJobOpeningService jobOpeningService, IJobApplicationService jobApplicationService)
    {
        _jobOpeningService = jobOpeningService;
        _jobApplicationService = jobApplicationService;
    }

    [HttpGet("jobs")]
    [AllowAnonymous]
    public async Task<IActionResult> GetJobs([FromQuery] Guid orgId, CancellationToken cancellationToken)
    {
        if (orgId == Guid.Empty)
        {
            return BadRequest("orgId is required");
        }

        var jobs = await _jobOpeningService.GetPublishedAsync(orgId, cancellationToken);
        return Ok(jobs);
    }

    [HttpPost("jobs")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateJob(CreateJobOpeningRequest request, CancellationToken cancellationToken)
    {
        var job = await _jobOpeningService.CreateAsync(new JobOpening
        {
            OrgId = request.OrgId,
            Title = request.Title,
            Department = request.Department ?? string.Empty,
            Location = request.Location ?? string.Empty,
            Description = request.Description ?? string.Empty,
            IsPublished = request.IsPublished
        }, cancellationToken);

        return CreatedAtAction(nameof(GetJob), new { jobId = job.Id }, job);
    }

    [HttpGet("jobs/{jobId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetJob(Guid jobId, CancellationToken cancellationToken)
    {
        var job = await _jobOpeningService.GetAsync(jobId, cancellationToken);
        if (job is null)
        {
            return NotFound();
        }

        return Ok(job);
    }

    [HttpPatch("jobs/{jobId:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateJob(Guid jobId, UpdateJobOpeningRequest request, CancellationToken cancellationToken)
    {
        var job = await _jobOpeningService.UpdateAsync(new JobOpening
        {
            Id = jobId,
            Title = request.Title,
            Department = request.Department ?? string.Empty,
            Location = request.Location ?? string.Empty,
            Description = request.Description ?? string.Empty,
            IsPublished = request.IsPublished
        }, cancellationToken);

        return Ok(job);
    }

    [HttpGet("jobs/{jobId:guid}/applications")]
    public async Task<IActionResult> GetApplications(Guid jobId, CancellationToken cancellationToken)
    {
        var applications = await _jobApplicationService.GetByJobAsync(jobId, cancellationToken);
        return Ok(applications);
    }

    [HttpPost("jobs/{jobId:guid}/applications")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitApplication(Guid jobId, JobApplicationRequest request, CancellationToken cancellationToken)
    {
        if (jobId != request.JobOpeningId)
        {
            return BadRequest("Job identifier mismatch");
        }

        var created = await _jobApplicationService.CreateAsync(new JobApplication
        {
            JobOpeningId = jobId,
            CandidateName = request.CandidateName,
            Email = request.Email,
            Phone = request.Phone,
            ResumeUrl = request.ResumeUrl,
            Notes = request.Notes,
            Stage = request.Stage ?? "Applied"
        }, cancellationToken);

        return CreatedAtAction(nameof(GetApplications), new { jobId }, created);
    }

    [HttpPatch("applications/{applicationId:guid}/stage")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateStage(Guid applicationId, UpdateApplicationStageRequest request, CancellationToken cancellationToken)
    {
        var updated = await _jobApplicationService.UpdateStageAsync(applicationId, request.Stage, cancellationToken);
        return Ok(updated);
    }
}
