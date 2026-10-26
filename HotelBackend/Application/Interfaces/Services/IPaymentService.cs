namespace Application.Interfaces.Repositories.Payments;

public interface IPaymentService
{
    Task<string?> CallPaymentApiAsync(string saleId, string userId, decimal amount);
}

