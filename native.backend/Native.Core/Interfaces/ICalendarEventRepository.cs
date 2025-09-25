using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ICalendarEventRepository : IGenericRepository<CalendarEvent>
{
    Task<IEnumerable<CalendarEvent>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default);

    Task<IEnumerable<CalendarEvent>> GetByCalendarAsync(
        Guid calendarId,
        DateTime? start = null,
        DateTime? end = null,
        CancellationToken cancellationToken = default);
}
