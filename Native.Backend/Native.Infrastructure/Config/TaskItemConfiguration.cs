using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Native.Core.Entities;

namespace Native.Infrastructure.Config;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.Property(t => t.Title).IsRequired().HasMaxLength(128);
        builder.Property(t => t.Description).HasMaxLength(2048);
        builder.Property(t => t.Status).HasMaxLength(32);
        builder.Property(t => t.Priority).HasMaxLength(32);
    }
}
