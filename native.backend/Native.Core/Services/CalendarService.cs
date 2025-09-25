using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Core.Services;

public class CalendarService : ICalendarService
{
    private readonly ICalendarBoardRepository _calendarRepository;
    private readonly ICalendarEventRepository _calendarEventRepository;

    public CalendarService(
        ICalendarBoardRepository calendarRepository,
        ICalendarEventRepository calendarEventRepository)
    {
        _calendarRepository = calendarRepository;
        _calendarEventRepository = calendarEventRepository;
    }

    public Task<IEnumerable<CalendarBoard>> GetCalendarsForUserAsync(Guid userId, CancellationToken cancellationToken = default)
        => _calendarRepository.GetForUserAsync(userId, cancellationToken);

    public async Task<CalendarBoard> CreateCalendarAsync(
        CalendarBoard calendar,
        IEnumerable<Guid> sharedUserIds,
        CancellationToken cancellationToken = default)
    {
        calendar.Id = calendar.Id == Guid.Empty ? Guid.NewGuid() : calendar.Id;
        calendar.SharedUsers = BuildShares(calendar.Id, calendar.Visibility, sharedUserIds);
        var created = await _calendarRepository.AddAsync(calendar, cancellationToken);
        await _calendarRepository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public async Task<CalendarBoard> UpdateCalendarAsync(
        Guid calendarId,
        Guid requesterId,
        string name,
        CalendarVisibility visibility,
        IEnumerable<Guid> sharedUserIds,
        CancellationToken cancellationToken = default)
    {
        var calendar = await _calendarRepository.GetWithSharesAsync(calendarId, cancellationToken)
                       ?? throw new KeyNotFoundException($"Calendar {calendarId} not found");

        if (calendar.OwnerId != requesterId)
        {
            throw new UnauthorizedAccessException("Only the owner can update the calendar");
        }

        calendar.Name = name;
        calendar.Visibility = visibility;

        calendar.SharedUsers.Clear();
        foreach (var share in BuildShares(calendar.Id, visibility, sharedUserIds))
        {
            calendar.SharedUsers.Add(share);
        }

        await _calendarRepository.SaveChangesAsync(cancellationToken);
        return calendar;
    }

    public async Task DeleteCalendarAsync(Guid calendarId, Guid requesterId, CancellationToken cancellationToken = default)
    {
        var calendar = await _calendarRepository.GetWithSharesAsync(calendarId, cancellationToken)
                       ?? throw new KeyNotFoundException($"Calendar {calendarId} not found");

        if (calendar.OwnerId != requesterId)
        {
            throw new UnauthorizedAccessException("Only the owner can delete the calendar");
        }

        await _calendarRepository.RemoveAsync(calendar, cancellationToken);
        await _calendarRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<CalendarEvent>> GetEventsForCalendarAsync(
        Guid calendarId,
        Guid requesterId,
        DateTime? start,
        DateTime? end,
        CancellationToken cancellationToken = default)
    {
        var calendar = await _calendarRepository.GetAccessibleCalendarAsync(calendarId, requesterId, cancellationToken);
        if (calendar is null)
        {
            throw new UnauthorizedAccessException("You do not have access to this calendar");
        }

        return await _calendarEventRepository.GetByCalendarAsync(calendarId, start, end, cancellationToken);
    }

    public async Task<CalendarEvent> UpsertEventAsync(CalendarEvent calendarEvent, Guid requesterId, CancellationToken cancellationToken = default)
    {
        var calendar = await _calendarRepository.GetAccessibleCalendarAsync(calendarEvent.CalendarId, requesterId, cancellationToken);
        if (calendar is null)
        {
            throw new UnauthorizedAccessException("You do not have access to this calendar");
        }

        if (calendarEvent.Id == Guid.Empty)
        {
            calendarEvent.Id = Guid.NewGuid();
        }

        var existing = await _calendarEventRepository.GetByIdAsync(calendarEvent.Id, cancellationToken);
        if (existing is null)
        {
            calendarEvent.CreatedById = requesterId;
            var created = await _calendarEventRepository.AddAsync(calendarEvent, cancellationToken);
            await _calendarEventRepository.SaveChangesAsync(cancellationToken);
            return created;
        }

        if (existing.CalendarId != calendarEvent.CalendarId)
        {
            throw new UnauthorizedAccessException("Cannot move events between calendars");
        }

        existing.Title = calendarEvent.Title;
        existing.Location = calendarEvent.Location;
        existing.Start = calendarEvent.Start;
        existing.End = calendarEvent.End;
        existing.IsAllDay = calendarEvent.IsAllDay;
        existing.TaskId = calendarEvent.TaskId;
        existing.Provider = calendarEvent.Provider;
        existing.ExternalEventId = calendarEvent.ExternalEventId;

        await _calendarEventRepository.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task DeleteEventAsync(Guid calendarId, Guid eventId, Guid requesterId, CancellationToken cancellationToken = default)
    {
        var calendar = await _calendarRepository.GetAccessibleCalendarAsync(calendarId, requesterId, cancellationToken);
        if (calendar is null)
        {
            throw new UnauthorizedAccessException("You do not have access to this calendar");
        }

        var calendarEvent = await _calendarEventRepository.GetByIdAsync(eventId, cancellationToken)
                             ?? throw new KeyNotFoundException($"Event {eventId} not found");

        if (calendarEvent.CalendarId != calendarId)
        {
            throw new UnauthorizedAccessException("Event does not belong to this calendar");
        }

        await _calendarEventRepository.RemoveAsync(calendarEvent, cancellationToken);
        await _calendarEventRepository.SaveChangesAsync(cancellationToken);
    }

    public Task<IEnumerable<CalendarEvent>> GetEventsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
        => _calendarEventRepository.GetByTaskAsync(taskId, cancellationToken);

    private static List<CalendarShare> BuildShares(Guid calendarId, CalendarVisibility visibility, IEnumerable<Guid> sharedUserIds)
    {
        if (visibility != CalendarVisibility.Shared)
        {
            return new List<CalendarShare>();
        }

        return sharedUserIds
            .Where(id => id != Guid.Empty)
            .Distinct()
            .Select(id => new CalendarShare { CalendarId = calendarId, UserId = id })
            .ToList();
    }
}
