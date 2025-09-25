namespace Native.Api.DTOs;

public record RegisterRequest(string Email, string Password, string FullName, string Role);
