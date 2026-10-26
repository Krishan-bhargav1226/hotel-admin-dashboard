using Application.Dto.Expenses;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Expenses;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Entities.Hotels;

namespace Application.Features.Expenses.Queries;

public class GetAllExpenseQuery : IRequest<PaginatedResult<GetExpenseDto>>
{
    public string? Search { get; set; }
    public ExpenseCategory? Category { get; set; }
    public PaymentMode? PaymentMode { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllExpenseQueryHandler : IRequestHandler<GetAllExpenseQuery, PaginatedResult<GetExpenseDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllExpenseQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetExpenseDto>> Handle(GetAllExpenseQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<HotelExpense>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(search) || (x.PaidTo != null && x.PaidTo.ToLower().Contains(search)));
        }

        if (request.Category != null)
            query = query.Where(x => x.Category == request.Category);
        if (request.PaymentMode != null)
            query = query.Where(x => x.PaymentMode == request.PaymentMode);
        query = query.OrderByDescending(x => x.ExpenseDate);
        return await ListQuery.ToPagedResultAsync<HotelExpense, GetExpenseDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
