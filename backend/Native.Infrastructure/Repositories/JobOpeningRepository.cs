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

public class JobOpeningRepository : GenericRepository<JobOpening>, IJobOpeningRepository
{
    public JobOpeningRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<JobOpening>> GetPublishedAsync(Guid orgId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(j => j.OrgId == orgId && j.IsPublished)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
