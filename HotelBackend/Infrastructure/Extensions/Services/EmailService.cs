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


            var senderEmail = _configuration["EmailSettings:Username"];
            string? senderPassword = _configuration["EmailSettings:Password"];
            var smtp = _configuration["EmailSettings:SmtpServer"];
            var port = int.Parse(_configuration["EmailSettings:Port"]);
            var displayName = _configuration["EmailSettings:DisplayName"];

            SmtpClient smtpClient = new SmtpClient(smtp)
            {
                Port = port,
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true

            };

            using (MailMessage message = new MailMessage())
            {
                message.From = new MailAddress(senderEmail,displayName);
                message.To.Add(recipientEmail);
                message.Subject = subject;
                message.Body = htmlbody;
                message.IsBodyHtml = true;

                await smtpClient.SendMailAsync(message);
            }

        }
        catch (Exception)
        {

            throw;
        }
    }
}
