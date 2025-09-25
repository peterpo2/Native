using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface ICalendarRepository : IGenericRepository<CalendarEvent>
{
    Task<IEnumerable<CalendarEvent>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
}
