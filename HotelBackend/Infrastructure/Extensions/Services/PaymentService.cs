using Application.Dto.Payments;
using Application.Interfaces.Repositories.Payments;
using Domain.Entities.ApplicationUsers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Infrastructure.Extensions.Services;

public class PaymentService: IPaymentService
{
    private readonly UserManager<User> _userManager;

    public PaymentService(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<string?> CallPaymentApiAsync(string saleId, string userId, decimal amount)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
        string key = "783JKHJSDKJ-ASDASQWE-23423";

        using var httpClient = new HttpClient();

        var url = $"https://cd-api-dev.codedonor.in/api/payment?Amount={amount}&Name={user.FirstName.Trim()}&Phone={user.PhoneNumber}&Email={user.Email}&SaleId={saleId}&Key={key}";


        try
        {
            var response = await httpClient.GetAsync(url);

            var responseContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"API Raw Response: {responseContent}");

            if (!response.IsSuccessStatusCode)
            {
                // Optionally log details
                Console.WriteLine($"Payment API returned error {response.StatusCode}: {responseContent}");
                return null;
            }

            // Deserialize JSON
            var paymentResponse = JsonSerializer.Deserialize<PaymentApiResponse>(
                responseContent,
                new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            if (paymentResponse == null || !paymentResponse.Succeeded)
                return null;

            return paymentResponse.Data; 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Payment API call failed: {ex.Message}");
            return null;
        }
    }

}
