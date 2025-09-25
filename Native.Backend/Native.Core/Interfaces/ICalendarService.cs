using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ICalendarService
{
    Task<CalendarEvent> CreateOrUpdateEventAsync(CalendarEvent calendarEvent, CancellationToken cancellationToken = default);
    Task<IEnumerable<CalendarEvent>> GetEventsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task DeleteEventAsync(Guid eventId, CancellationToken cancellationToken = default);
}
