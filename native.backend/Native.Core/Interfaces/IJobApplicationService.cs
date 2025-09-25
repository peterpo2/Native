using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IJobApplicationService
{
    Task<JobApplication> CreateAsync(JobApplication application, CancellationToken cancellationToken = default);
    Task<IEnumerable<JobApplication>> GetAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<JobApplication>> GetByJobAsync(Guid jobOpeningId, CancellationToken cancellationToken = default);
    Task<JobApplication> UpdateStageAsync(Guid applicationId, string stage, CancellationToken cancellationToken = default);
}
