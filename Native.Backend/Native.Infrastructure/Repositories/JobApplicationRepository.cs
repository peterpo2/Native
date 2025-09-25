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

public class JobApplicationRepository : GenericRepository<JobApplication>, IJobApplicationRepository
{
    public JobApplicationRepository(NativeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<JobApplication>> GetByJobAsync(Guid jobOpeningId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(a => a.JobOpeningId == jobOpeningId)
            .OrderBy(a => a.Stage)
            .ThenByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);
    }
}
