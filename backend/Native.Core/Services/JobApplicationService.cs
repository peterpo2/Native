using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Core.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly IJobApplicationRepository _repository;

    public JobApplicationService(IJobApplicationRepository repository)
    {
        _repository = repository;
    }

    public async Task<JobApplication> CreateAsync(JobApplication application, CancellationToken cancellationToken = default)
    {
        var created = await _repository.AddAsync(application, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public Task<IEnumerable<JobApplication>> GetAsync(CancellationToken cancellationToken = default)
        => _repository.GetAllAsync(cancellationToken);
}
