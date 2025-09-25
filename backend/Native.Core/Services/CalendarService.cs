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
        await _calendarRepository.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public Task<IEnumerable<CalendarEvent>> GetEventsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
        => _calendarRepository.GetByTaskAsync(taskId, cancellationToken);
}
