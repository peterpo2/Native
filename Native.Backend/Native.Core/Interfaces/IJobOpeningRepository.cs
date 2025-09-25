using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IJobOpeningRepository : IGenericRepository<JobOpening>
{
    Task<IEnumerable<JobOpening>> GetPublishedAsync(Guid orgId, CancellationToken cancellationToken = default);
}
