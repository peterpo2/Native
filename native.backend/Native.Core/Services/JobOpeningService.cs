using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Core.Services;

public class JobOpeningService : IJobOpeningService
{
    private readonly IJobOpeningRepository _repository;

    public JobOpeningService(IJobOpeningRepository repository)
    {
        _repository = repository;
    }

    public async Task<JobOpening> CreateAsync(JobOpening opening, CancellationToken cancellationToken = default)
    {
        var created = await _repository.AddAsync(opening, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return created;
    }

    public async Task<JobOpening> UpdateAsync(JobOpening opening, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(opening.Id, cancellationToken)
                        ?? throw new KeyNotFoundException($"Job opening {opening.Id} not found");

        existing.Title = opening.Title;
        existing.Department = opening.Department;
        existing.Location = opening.Location;
        existing.Description = opening.Description;
        existing.IsPublished = opening.IsPublished;

        await _repository.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public Task<IEnumerable<JobOpening>> GetPublishedAsync(Guid orgId, CancellationToken cancellationToken = default)
        => _repository.GetPublishedAsync(orgId, cancellationToken);

    public Task<JobOpening?> GetAsync(Guid id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);
}
