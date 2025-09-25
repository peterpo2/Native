using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class CalendarEventRequestValidator : AbstractValidator<CalendarEventRequest>
{
    public CalendarEventRequestValidator()
    {
        RuleFor(x => x.CalendarId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ExternalEventId).MaximumLength(256);
        RuleFor(x => x.Location).MaximumLength(256);
        RuleFor(x => x.Start).LessThan(x => x.End);
    }
}
