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

public class CalendarBoardRepository : GenericRepository<CalendarBoard>, ICalendarBoardRepository
{
    public CalendarBoardRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CalendarBoard>> GetForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Calendars
            .Include(c => c.SharedUsers)
            .Where(c => c.OwnerId == userId ||
                        c.Visibility == CalendarVisibility.Public ||
                        (c.Visibility == CalendarVisibility.Shared &&
                         c.SharedUsers.Any(s => s.UserId == userId)))
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CalendarBoard?> GetAccessibleCalendarAsync(Guid calendarId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Calendars
            .Include(c => c.SharedUsers)
            .FirstOrDefaultAsync(
                c => c.Id == calendarId &&
                     (c.OwnerId == userId ||
                      c.Visibility == CalendarVisibility.Public ||
                      (c.Visibility == CalendarVisibility.Shared && c.SharedUsers.Any(s => s.UserId == userId))),
                cancellationToken);
    }

    public async Task<CalendarBoard?> GetWithSharesAsync(Guid calendarId, CancellationToken cancellationToken = default)
    {
        return await Context.Calendars
            .IgnoreQueryFilters()
            .Include(c => c.SharedUsers)
            .FirstOrDefaultAsync(c => c.Id == calendarId && !c.IsDeleted, cancellationToken);
    }
}
