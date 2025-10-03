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
    public DbSet<CalendarBoard> Calendars => Set<CalendarBoard>();
    public DbSet<CalendarShare> CalendarShares => Set<CalendarShare>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<JobOpening> JobOpenings => Set<JobOpening>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<IntegrationConnection> IntegrationConnections => Set<IntegrationConnection>();

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
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        modelBuilder.Entity<TaskItem>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(t => t.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskAttachment>()
            .HasOne<TaskItem>()
            .WithMany(t => t.Attachments)
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CalendarBoard>()
            .Property(c => c.Visibility)
            .HasConversion<string>()
            .HasMaxLength(16);

        modelBuilder.Entity<CalendarBoard>()
            .HasMany(c => c.Events)
            .WithOne(e => e.Calendar)
            .HasForeignKey(e => e.CalendarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CalendarBoard>()
            .HasMany(c => c.SharedUsers)
            .WithOne(s => s.Calendar)
            .HasForeignKey(s => s.CalendarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CalendarShare>()
            .HasKey(s => new { s.CalendarId, s.UserId });

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

        modelBuilder.Entity<IntegrationConnection>()
            .Property(c => c.Provider)
            .HasMaxLength(64);

        modelBuilder.Entity<IntegrationConnection>()
            .Property(c => c.AccountId)
            .HasMaxLength(128);

        modelBuilder.Entity<IntegrationConnection>()
            .HasIndex(c => new { c.Provider, c.UserId })
            .IsUnique();

        modelBuilder.Entity<IntegrationConnection>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<IntegrationConnection>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(c => c.OrganizationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
