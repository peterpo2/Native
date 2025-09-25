using Microsoft.EntityFrameworkCore;
using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Infrastructure.Data;

namespace Native.Infrastructure.Repositories;

public class CalendarRepository : GenericRepository<CalendarEvent>, ICalendarRepository
{
    public CalendarRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CalendarEvent>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(e => e.TaskId == taskId)
            .OrderBy(e => e.Start)
            .ToListAsync(cancellationToken);
    }
}
