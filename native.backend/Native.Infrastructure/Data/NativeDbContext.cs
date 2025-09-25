using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Native.Core.Entities;
using Native.Infrastructure.Config;

namespace Native.Infrastructure.Data;

public class NativeDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public NativeDbContext(DbContextOptions<NativeDbContext> options) : base(options)
    {
    }

    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskAttachment> TaskAttachments => Set<TaskAttachment>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<JobOpening> JobOpenings => Set<JobOpening>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new TaskItemConfiguration());

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne<Organization>()
            .WithMany(o => o.Users)
            .HasForeignKey(u => u.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Project>()
            .Property(p => p.Color)
            .HasMaxLength(16);

        modelBuilder.Entity<Project>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(p => p.OrgId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .HasOne<Project>()
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskAttachment>()
            .HasOne<TaskItem>()
            .WithMany(t => t.Attachments)
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<JobOpening>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(o => o.OrgId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<JobApplication>()
            .HasOne<JobOpening>()
            .WithMany(o => o.Applications)
            .HasForeignKey(a => a.JobOpeningId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
