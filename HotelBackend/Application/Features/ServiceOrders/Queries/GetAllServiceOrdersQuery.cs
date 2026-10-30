using Application.Dto.ServiceOrders;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.ServiceOrders;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.ServiceOrders.Queries;

public class GetAllServiceOrdersQuery : IRequest<PaginatedResult<GetServiceOrderDto>>
{
    public string? Search { get; set; }
    public int? RoomId { get; set; }
    public int? StayId { get; set; }
    public ServiceOrderStatus? Status { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllServiceOrdersQueryHandler : IRequestHandler<GetAllServiceOrdersQuery, PaginatedResult<GetServiceOrderDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllServiceOrdersQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetServiceOrderDto>> Handle(GetAllServiceOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<ServiceOrder>().Entities
            .Include(x => x.Lines)
            .AsQueryable();

        if (request.RoomId.HasValue)
            query = query.Where(x => x.RoomId == request.RoomId.Value);

        if (request.StayId.HasValue)
            query = query.Where(x => x.StayId == request.StayId.Value);

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.GuestName.ToLower().Contains(search) ||
                                     x.OrderNo.ToLower().Contains(search) ||
                                     x.RoomNumber.ToLower().Contains(search));
        }

        query = query.OrderByDescending(x => x.CreatedDate);

        var total = await query.CountAsync(cancellationToken);
        var page = request.PageNumber > 0 ? request.PageNumber : 1;
        var size = request.PageSize > 0 ? request.PageSize : 50;

        var items = await query.Skip((page - 1) * size).Take(size)
            .Select(x => new GetServiceOrderDto
            {
                Id = x.Id,
                OrderNo = x.OrderNo,
                RoomId = x.RoomId,
                RoomNumber = x.RoomNumber,
                StayId = x.StayId,
                GuestName = x.GuestName,
                Subtotal = x.Subtotal,
                TaxPercent = x.TaxPercent,
                TaxAmount = x.TaxAmount,
                TotalAmount = x.TotalAmount,
                BilledToRoom = x.BilledToRoom,
                PaymentMode = x.PaymentMode,
                Status = x.Status,
                Notes = x.Notes,
                CreatedDate = x.CreatedDate,
                Items = x.Lines.Select(l => new GetServiceOrderItemDto
                {
                    MenuItemId = l.PosItemId,
                    Name = l.Name,
                    Price = l.Price,
                    Quantity = l.Quantity
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return PaginatedResult<GetServiceOrderDto>.Create(items, total, page, size);
    }
}
