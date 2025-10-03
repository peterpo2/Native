using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Native.Core.Interfaces;
using Native.Infrastructure.Data;

namespace Native.Infrastructure.Repositories;

public class GenericRepository<TEntity> : IGenericRepository<TEntity>
    where TEntity : class
{
    protected readonly NativeDbContext Context;
    protected readonly DbSet<TEntity> DbSet;

    public GenericRepository(NativeDbContext context)
    {
        Context = context;
        DbSet = Context.Set<TEntity>();
    }

    public async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        var entry = await DbSet.AddAsync(entity, cancellationToken);
        return entry.Entity;
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
        => await DbSet.AsNoTracking().ToListAsync(cancellationToken);

    public virtual async Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await DbSet.FindAsync(new object?[] { id }, cancellationToken);
        if (entity is ISoftDeletable softDeletable && softDeletable.IsDeleted)
        {
            return null;
        }

        return entity;
    }

    public Task RemoveAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        if (entity is ISoftDeletable softDeletable)
        {
            softDeletable.IsDeleted = true;
            Context.Entry(entity).State = EntityState.Modified;
        }
        else
        {
            DbSet.Remove(entity);
        }

        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => Context.SaveChangesAsync(cancellationToken);
}
