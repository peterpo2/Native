using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ICalendarBoardRepository : IGenericRepository<CalendarBoard>
{
    Task<IEnumerable<CalendarBoard>> GetForUserAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<CalendarBoard?> GetAccessibleCalendarAsync(Guid calendarId, Guid userId, CancellationToken cancellationToken = default);

    Task<CalendarBoard?> GetWithSharesAsync(Guid calendarId, CancellationToken cancellationToken = default);
}
