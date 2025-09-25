using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Native.Api.DTOs;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    [HttpGet("task/{taskId:guid}")]
    public async Task<IActionResult> GetEvents(Guid taskId, CancellationToken cancellationToken)
    {
        var events = await _calendarService.GetEventsForTaskAsync(taskId, cancellationToken);
        return Ok(events);
    }

    [HttpPost]
    public async Task<IActionResult> Upsert(CalendarEventRequest request, CancellationToken cancellationToken)
    {
        var calendarEvent = await _calendarService.CreateOrUpdateEventAsync(new CalendarEvent
        {
            Id = request.Id ?? Guid.NewGuid(),
            TaskId = request.TaskId,
            Provider = request.Provider,
            ExternalEventId = request.ExternalEventId,
            Start = request.Start,
            End = request.End
        }, cancellationToken);

        return Ok(calendarEvent);
    }
}
