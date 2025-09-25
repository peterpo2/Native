using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ICalendarRepository : IGenericRepository<CalendarEvent>
{
    Task<IEnumerable<CalendarEvent>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
}
