namespace Application.Interfaces.Services;

public interface IEmailService
{
    public Task SendEmail(string recipientEmail, string subject, string htmlBody);
}
