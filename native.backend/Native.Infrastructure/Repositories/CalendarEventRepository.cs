using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Infrastructure.Data;

namespace Native.Infrastructure.Repositories;

public class CalendarEventRepository : GenericRepository<CalendarEvent>, ICalendarEventRepository
{
    public CalendarEventRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CalendarEvent>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(e => e.TaskId == taskId)
            .OrderBy(e => e.Start)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<CalendarEvent>> GetByCalendarAsync(
        Guid calendarId,
        DateTime? start = null,
        DateTime? end = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(e => e.CalendarId == calendarId);

        if (start.HasValue)
        {
            query = query.Where(e => e.End >= start.Value);
        }

        if (end.HasValue)
        {
            query = query.Where(e => e.Start <= end.Value);
        }

        return await query
            .OrderBy(e => e.Start)
            .ThenBy(e => e.End)
            .ToListAsync(cancellationToken);
    }
}
