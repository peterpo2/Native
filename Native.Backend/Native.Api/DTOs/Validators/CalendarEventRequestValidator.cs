using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class CalendarEventRequestValidator : AbstractValidator<CalendarEventRequest>
{
    public CalendarEventRequestValidator()
    {
        RuleFor(x => x.TaskId).NotEmpty();
        RuleFor(x => x.Provider).NotEmpty();
        RuleFor(x => x.Start).LessThan(x => x.End);
    }
}
