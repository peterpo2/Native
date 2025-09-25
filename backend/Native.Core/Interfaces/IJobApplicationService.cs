using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IJobApplicationService
{
    Task<JobApplication> CreateAsync(JobApplication application, CancellationToken cancellationToken = default);
    Task<IEnumerable<JobApplication>> GetAsync(CancellationToken cancellationToken = default);
}
