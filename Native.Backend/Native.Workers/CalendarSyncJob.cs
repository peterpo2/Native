using Native.Core.Interfaces;

namespace Native.Workers;

public class CalendarSyncJob
{
    private readonly ICalendarService _calendarService;

    public CalendarSyncJob(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public async Task RunAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var events = await _calendarService.GetEventsForTaskAsync(taskId, cancellationToken);
        // Placeholder for pushing updates to external providers.
        foreach (var calendarEvent in events)
        {
            // Sync logic would live here.
        }
    }
}
