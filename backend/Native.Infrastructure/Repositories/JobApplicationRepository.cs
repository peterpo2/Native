using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Infrastructure.Data;

namespace Native.Infrastructure.Repositories;

public class JobApplicationRepository : GenericRepository<JobApplication>, IJobApplicationRepository
{
    public JobApplicationRepository(NativeDbContext context) : base(context)
    {
    }
}
