using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Core.Services;

public class CalendarService : ICalendarService
{
    private readonly ICalendarRepository _calendarRepository;

    public CalendarService(ICalendarRepository calendarRepository)
    {
        _calendarRepository = calendarRepository;
    }

    public async Task<CalendarEvent> CreateOrUpdateEventAsync(CalendarEvent calendarEvent, CancellationToken cancellationToken = default)
    {
        var existing = await _calendarRepository.GetByIdAsync(calendarEvent.Id, cancellationToken);
        if (existing is null)
        {
            var created = await _calendarRepository.AddAsync(calendarEvent, cancellationToken);
            await _calendarRepository.SaveChangesAsync(cancellationToken);
            return created;
        }

        existing.ExternalEventId = calendarEvent.ExternalEventId;
        existing.Provider = calendarEvent.Provider;
        existing.Start = calendarEvent.Start;
        existing.End = calendarEvent.End;
        existing.Title = calendarEvent.Title;
        existing.Location = calendarEvent.Location;
        existing.IsAllDay = calendarEvent.IsAllDay;
        await _calendarRepository.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public Task<IEnumerable<CalendarEvent>> GetEventsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
        => _calendarRepository.GetByTaskAsync(taskId, cancellationToken);

    public async Task DeleteEventAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var calendarEvent = await _calendarRepository.GetByIdAsync(eventId, cancellationToken)
                             ?? throw new KeyNotFoundException($"Event {eventId} not found");
        await _calendarRepository.RemoveAsync(calendarEvent, cancellationToken);
        await _calendarRepository.SaveChangesAsync(cancellationToken);
    }
}
