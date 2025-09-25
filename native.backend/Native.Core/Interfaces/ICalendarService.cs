using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ICalendarService
{
    Task<IEnumerable<CalendarBoard>> GetCalendarsForUserAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<CalendarBoard> CreateCalendarAsync(
        CalendarBoard calendar,
        IEnumerable<Guid> sharedUserIds,
        CancellationToken cancellationToken = default);

    Task<CalendarBoard> UpdateCalendarAsync(
        Guid calendarId,
        Guid requesterId,
        string name,
        CalendarVisibility visibility,
        IEnumerable<Guid> sharedUserIds,
        CancellationToken cancellationToken = default);

    Task DeleteCalendarAsync(Guid calendarId, Guid requesterId, CancellationToken cancellationToken = default);

    Task<IEnumerable<CalendarEvent>> GetEventsForCalendarAsync(
        Guid calendarId,
        Guid requesterId,
        DateTime? start,
        DateTime? end,
        CancellationToken cancellationToken = default);

    Task<CalendarEvent> UpsertEventAsync(CalendarEvent calendarEvent, Guid requesterId, CancellationToken cancellationToken = default);

    Task DeleteEventAsync(Guid calendarId, Guid eventId, Guid requesterId, CancellationToken cancellationToken = default);

    Task<IEnumerable<CalendarEvent>> GetEventsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
}
