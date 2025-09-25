using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IJobApplicationRepository : IGenericRepository<JobApplication>
{
    Task<IEnumerable<JobApplication>> GetByJobAsync(Guid jobOpeningId, CancellationToken cancellationToken = default);
}
