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
    private readonly IJobApplicationService _jobApplicationService;

    public CareersController(IJobApplicationService jobApplicationService)
    {
        _jobApplicationService = jobApplicationService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var applications = await _jobApplicationService.GetAsync(cancellationToken);
        return Ok(applications);
    }

    [HttpPost]
    public async Task<IActionResult> Create(JobApplicationRequest request, CancellationToken cancellationToken)
    {
        var created = await _jobApplicationService.CreateAsync(new JobApplication
        {
            CandidateName = request.CandidateName,
            Email = request.Email,
            Stage = request.Stage
        }, cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }
}
