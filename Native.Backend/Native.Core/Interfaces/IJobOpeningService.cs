using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IJobOpeningService
{
    Task<JobOpening> CreateAsync(JobOpening opening, CancellationToken cancellationToken = default);
    Task<JobOpening> UpdateAsync(JobOpening opening, CancellationToken cancellationToken = default);
    Task<IEnumerable<JobOpening>> GetPublishedAsync(Guid orgId, CancellationToken cancellationToken = default);
    Task<JobOpening?> GetAsync(Guid id, CancellationToken cancellationToken = default);
}
