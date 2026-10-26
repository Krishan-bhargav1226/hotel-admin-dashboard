using Application.Features.SupportTickets.Commands;
using Application.Features.SupportTickets.Queries;
using Domain.Common.Enums.PriorityTypes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.SupportTickets
{
    [Route("api/support-ticket")]
    [ApiController]
    public class SupportTicketController : ControllerBase
    {

        private readonly IMediator _mediator;

        public SupportTicketController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> CreateSupportTicket(CreateSupportTicketCommand command)
        {
            var data = await _mediator.Send(command);
            return ResponseHelper.GenerateResponse(data);
        }

        [AllowAnonymous]
        [HttpPost("conversation")]
        public async Task<ActionResult> CreateTicketConversation(CreateTicketConversationCommand command)
        {
            var data = await _mediator.Send(command);
            return ResponseHelper.GenerateResponse(data);
        }

        [HttpGet]
        public async Task<ActionResult> GetSupportTicket([FromQuery] GetSupportTicketQuery query)
        {
            var data = await _mediator.Send(query);
            return ResponseHelper.GenerateResponse(data);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetSupportTicketById(int id)
        {
            var data = await _mediator.Send(new GetSupportTicketByIdQuery(id));
            return ResponseHelper.GenerateResponse(data);
        }

        [AllowAnonymous]
        [HttpGet("conversation/{ticketId}")]
        public async Task<ActionResult> GetTicketConversationByTicketId(int ticketId)
        {
            var data = await _mediator.Send(new GetTicketConversationByTicketIdQuery(ticketId));
            return ResponseHelper.GenerateResponse(data);
        }

        [HttpGet("conversation/user/{userId}")]
        public async Task<ActionResult> GetTicketConversationByUserId(string userId)
        {
            var data = await _mediator.Send(new GetTicketConversationByUserIdQuery(userId));
            return ResponseHelper.GenerateResponse(data);
        }

        [AllowAnonymous]
        [HttpGet("user/{userId}")]
        public async Task<ActionResult> GetSupportTicketByUserId(string userId)
        {
            var data = await _mediator.Send(new GetSupportTicketByUserIdQuery(userId));
            return ResponseHelper.GenerateResponse(data);
        }

        [HttpPut("ticket-status/{id}")]
        public async Task<ActionResult> UpdateTicketStatus(int id, int status)
        {
            var data = await _mediator.Send(new UpdateTicketStatusCommand(id, status));
            return ResponseHelper.GenerateResponse(data);
        }

        [HttpPut("assignto-status/{id}")]
        public async Task<ActionResult> UpdateAssignToStatus(int id, string assignedTo)
        {
            var data = await _mediator.Send(new UpdateAssignToCommand(id, assignedTo));
            return ResponseHelper.GenerateResponse(data);
        }

        [HttpPut("priority/{id}")]
        public async Task<ActionResult> UpdatePriority(int id, PriorityType priority)
        {
            var data = await _mediator.Send(new UpdatePriorityCommand(id, priority));
            return ResponseHelper.GenerateResponse(data);
        }


    }
}
