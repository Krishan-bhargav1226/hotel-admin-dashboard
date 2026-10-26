using Application.Dto.Expenses;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Expenses;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Expenses.Queries;

public class GetExpenseByIdQuery : IRequest<Result<GetExpenseDto>>
{
    public int Id { get; set; }

    public GetExpenseByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetExpenseByIdQueryHandler : IRequestHandler<GetExpenseByIdQuery, Result<GetExpenseDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetExpenseByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetExpenseDto>> Handle(GetExpenseByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<HotelExpense>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetExpenseDto>.BadRequest("Expense does not exist.");

        return Result<GetExpenseDto>.Success(_mapper.Map<GetExpenseDto>(entity), "Expense retrieved successfully.");
    }
}
