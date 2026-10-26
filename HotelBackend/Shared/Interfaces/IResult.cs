namespace Shared.Interfaces;

public interface IResult<T>
{
    List<string> Messages { get; set; }
    bool Successed { get; set; }
    T Data { get; set; }
    int Code { get; set; }
    string Token { get; set; }
    Exception Exception { get; set; }
}
