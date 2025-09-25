using System;
using FluentValidation;
using Native.Core.Entities;

namespace Native.Api.DTOs.Validators;

public class CreateCalendarRequestValidator : AbstractValidator<CreateCalendarRequest>
{
    public CreateCalendarRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Visibility)
            .NotEmpty()
            .Must(value => Enum.TryParse<CalendarVisibility>(value, true, out _))
            .WithMessage("Visibility must be Private, Shared, or Public");

        When(
            x => string.Equals(x.Visibility, CalendarVisibility.Shared.ToString(), StringComparison.OrdinalIgnoreCase),
            () =>
            {
                RuleFor(x => x.SharedUserIds)
                    .NotNull()
                    .Must(ids => ids!.Length > 0)
                    .WithMessage("Shared calendars must include at least one user");
            });

        RuleForEach(x => x.SharedUserIds)
            .Must(id => id != Guid.Empty)
            .WithMessage("Shared user identifiers must be valid");
    }
}
