using Microsoft.AspNetCore.Mvc;
using Shared;

namespace WebApi;

public class ResponseHelper
{
    public static ActionResult GenerateResponse<T>(Result<T> data)
    {
        if (data.Successed)
        {
            var responseObject = new
            {
                messages = data.Messages,
                succeeded = data.Successed,
                data = data.Data,
                code=data.Code,
                exception = data.Exception,
                token = data.Token

            };

            return new OkObjectResult(responseObject);
        }
        else
        {
            var errorObject = new
            {
                messages = data.Messages,
                succeeded = data.Successed,
                data = data.Data,
                exception = data.Exception,
                code = data.Code,
                token = data.Token

            };

            return new ObjectResult(errorObject)
            {
                StatusCode = data.Code
            };
        }
    }
    
    public static ActionResult GeneratePaginatedResponse<T>(PaginatedResult<T> result)
    {
        var response = new
        {
            messages = result.Messages,
            succeeded = result.Successed,
            data = result.Data,
            code = result.Code,
            token = result.Token,
            exception = result.Exception,
            currentPage = result.CurrentPage,
            totalPages = result.TotalPages,
            totalCount = result.TotalCount,
            pageSize = result.PageSize,
            hasPreviousPage = result.HasPreviousPage,
            hasNextPage = result.HasNextPage
        };

        if (result.Successed) return new OkObjectResult(response);

        return new ObjectResult(response)
        {
            StatusCode = result.Code
        };
    }
}
