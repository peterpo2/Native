using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
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
        application.Stage = string.IsNullOrWhiteSpace(application.Stage) ? "Applied" : application.Stage;
        var created = await _repository.AddAsync(application, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public Task<IEnumerable<JobApplication>> GetAsync(CancellationToken cancellationToken = default)
        => _repository.GetAllAsync(cancellationToken);

    public Task<IEnumerable<JobApplication>> GetByJobAsync(Guid jobOpeningId, CancellationToken cancellationToken = default)
        => _repository.GetByJobAsync(jobOpeningId, cancellationToken);

    public async Task<JobApplication> UpdateStageAsync(Guid applicationId, string stage, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(stage))
        {
            throw new ArgumentException("Stage cannot be empty", nameof(stage));
        }

        var application = await _repository.GetByIdAsync(applicationId, cancellationToken)
                          ?? throw new KeyNotFoundException($"Application {applicationId} not found");

        application.Stage = stage;
        await _repository.SaveChangesAsync(cancellationToken);
        return application;
    }
}
