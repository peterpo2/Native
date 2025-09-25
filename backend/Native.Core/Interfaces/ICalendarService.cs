using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ICalendarService
{
    Task<CalendarEvent> CreateOrUpdateEventAsync(CalendarEvent calendarEvent, CancellationToken cancellationToken = default);
    Task<IEnumerable<CalendarEvent>> GetEventsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
}
