namespace Application.Dto.Payments;

public class PaymentApiResponse
{
    public string[] Messages { get; set; }
    public bool Succeeded { get; set; }
    public string Data { get; set; }
    public int Code { get; set; }
    public string Exception { get; set; }
    public string Token { get; set; }
}