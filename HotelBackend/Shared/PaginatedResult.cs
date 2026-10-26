namespace Shared;

public class PaginatedResult<T> : Result<T>
{
    public PaginatedResult(bool succeeded, List<T> data, List<string> messages, int count, int pageNumber, int pageSize, int code=200)
    {
        Data = data ?? new List<T>();
        Messages = messages ?? new List<string>();
        Successed = succeeded;
        CurrentPage = pageNumber > 0 ? pageNumber : 1;
        PageSize = pageSize > 0 ? pageSize : 10;
        TotalCount = count;
        TotalPages = pageSize > 0 ? (int)Math.Ceiling(count / (double)pageSize) : 0;
        Code = code;
    }

    public new IReadOnlyList<T> Data { get; }
    public int CurrentPage { get; }
    public int TotalPages { get; }
    public int TotalCount { get; }
    public int PageSize { get; }
    public bool HasPreviousPage => CurrentPage > 1;
    public bool HasNextPage => CurrentPage < TotalPages;

    public static PaginatedResult<T> Create(List<T> data, int count, int pageNumber, int pageSize, int code=200)
    {
        return new PaginatedResult<T>(true, data ?? new List<T>(), null, count, pageNumber, pageSize, code);
    }
}


