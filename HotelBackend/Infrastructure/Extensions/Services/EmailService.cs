using Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace Infrastructure.Extensions.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmail(string recipientEmail, string subject, string htmlbody)
    {
        try
        {
            var senderEmail = _configuration["EmailSettings:Username"] 
                ?? Environment.GetEnvironmentVariable("SMTP_USERNAME") 
                ?? "no-reply@hotel.local";
            string? senderPassword = _configuration["EmailSettings:Password"] 
                ?? Environment.GetEnvironmentVariable("SMTP_PASSWORD") 
                ?? "";
            var smtp = _configuration["EmailSettings:SmtpServer"] 
                ?? Environment.GetEnvironmentVariable("SMTP_SERVER") 
                ?? "smtp.gmail.com";
            var portString = _configuration["EmailSettings:Port"] 
                ?? Environment.GetEnvironmentVariable("SMTP_PORT");
            var port = int.TryParse(portString, out var p) ? p : 587;
            var displayName = _configuration["EmailSettings:DisplayName"] 
                ?? "Grand Horizon Luxury Hotels";

            using var smtpClient = new SmtpClient(smtp)
            {
                Port = port,
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true,
                Timeout = 15000
            };

            using var message = new MailMessage();
            message.From = new MailAddress(senderEmail, displayName);
            message.To.Add(recipientEmail);
            message.Subject = subject;
            message.Body = htmlbody;
            message.IsBodyHtml = true;

            await smtpClient.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SMTP ERROR]: Failed sending email to {recipientEmail}: {ex.Message}");
            throw;
        }
    }
}
