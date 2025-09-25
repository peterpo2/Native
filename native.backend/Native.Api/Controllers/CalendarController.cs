using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.Security.Claims;
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

    [HttpGet]
    public async Task<IActionResult> GetCalendars(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var calendars = await _calendarService.GetCalendarsForUserAsync(userId, cancellationToken);
        var response = calendars.Select(ToSummary);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCalendar(CreateCalendarRequest request, CancellationToken cancellationToken)
    {
        if (!TryParseVisibility(request.Visibility, out var visibility))
        {
            return BadRequest("Visibility must be Private, Shared, or Public");
        }

        var userId = GetUserId();
        var calendar = await _calendarService.CreateCalendarAsync(new CalendarBoard
        {
            OwnerId = userId,
            Name = request.Name,
            Visibility = visibility,
        }, request.SharedUserIds ?? Array.Empty<Guid>(), cancellationToken);

        return CreatedAtAction(nameof(GetCalendars), new { calendarId = calendar.Id }, ToSummary(calendar));
    }

    [HttpPut("{calendarId:guid}")]
    public async Task<IActionResult> UpdateCalendar(Guid calendarId, UpdateCalendarRequest request, CancellationToken cancellationToken)
    {
        if (!TryParseVisibility(request.Visibility, out var visibility))
        {
            return BadRequest("Visibility must be Private, Shared, or Public");
        }

        try
        {
            var updated = await _calendarService.UpdateCalendarAsync(
                calendarId,
                GetUserId(),
                request.Name,
                visibility,
                request.SharedUserIds ?? Array.Empty<Guid>(),
                cancellationToken);
            return Ok(ToSummary(updated));
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

    [HttpDelete("{calendarId:guid}")]
    public async Task<IActionResult> DeleteCalendar(Guid calendarId, CancellationToken cancellationToken)
    {
        try
        {
            await _calendarService.DeleteCalendarAsync(calendarId, GetUserId(), cancellationToken);
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

    [HttpGet("{calendarId:guid}/events")]
    public async Task<IActionResult> GetCalendarEvents(
        Guid calendarId,
        [FromQuery] DateTime? start,
        [FromQuery] DateTime? end,
        CancellationToken cancellationToken)
    {
        try
        {
            var events = await _calendarService.GetEventsForCalendarAsync(calendarId, GetUserId(), start, end, cancellationToken);
            return Ok(events);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("{calendarId:guid}/events")]
    public async Task<IActionResult> UpsertEvent(Guid calendarId, CalendarEventRequest request, CancellationToken cancellationToken)
    {
        if (request.CalendarId != calendarId)
        {
            return BadRequest("Calendar ID mismatch");
        }

        try
        {
            var calendarEvent = await _calendarService.UpsertEventAsync(new CalendarEvent
            {
                Id = request.Id ?? Guid.Empty,
                CalendarId = request.CalendarId,
                TaskId = request.TaskId,
                Title = request.Title,
                Location = request.Location,
                Start = request.Start,
                End = request.End,
                IsAllDay = request.IsAllDay,
                Provider = request.Provider ?? "Native",
                ExternalEventId = request.ExternalEventId ?? string.Empty,
            }, GetUserId(), cancellationToken);

            return Ok(calendarEvent);
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

    [HttpDelete("{calendarId:guid}/events/{eventId:guid}")]
    public async Task<IActionResult> DeleteEvent(Guid calendarId, Guid eventId, CancellationToken cancellationToken)
    {
        try
        {
            await _calendarService.DeleteEventAsync(calendarId, eventId, GetUserId(), cancellationToken);
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

    [HttpGet("task/{taskId:guid}")]
    public async Task<IActionResult> GetEventsForTask(Guid taskId, CancellationToken cancellationToken)
    {
        var events = await _calendarService.GetEventsForTaskAsync(taskId, cancellationToken);
        return Ok(events);
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id is null || !Guid.TryParse(id, out var userId))
        {
            throw new InvalidOperationException("User identifier missing from token");
        }

        return userId;
    }

    private static bool TryParseVisibility(string visibility, out CalendarVisibility result)
        => Enum.TryParse(visibility, ignoreCase: true, out result);

    private static CalendarSummary ToSummary(CalendarBoard calendar)
        => new(
            calendar.Id,
            calendar.Name,
            calendar.Visibility.ToString(),
            calendar.OwnerId,
            calendar.SharedUsers.Select(s => s.UserId));
}
