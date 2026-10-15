using System.Text.Json;
using HotelAdmin.Application.Storage.Commands;
using HotelAdmin.Application.Storage.Queries;
using HotelAdmin.Shared;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HotelAdmin.WebApi.Controllers;

[ApiController]
[Route(StorageApiRoutes.Storage)]
[RequestSizeLimit(30_000_000)]
public sealed class StorageController(ISender sender) : ControllerBase
{
    [HttpGet]
    [Produces("application/json")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var records = await sender.Send(new GetAllStorageRecordsQuery(), cancellationToken);
        var values = records.ToDictionary(
            record => record.Key,
            record => ParseJson(record.JsonValue));
        return Ok(values);
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> Get(string key, CancellationToken cancellationToken)
    {
        var record = await sender.Send(new GetStorageRecordQuery(key), cancellationToken);
        return record is null ? NotFound() : Content(record.JsonValue, "application/json");
    }

    [HttpPut("{key}")]
    [Consumes("application/json")]
    public async Task<IActionResult> Put(string key, [FromBody] JsonElement value, CancellationToken cancellationToken)
    {
        await sender.Send(new UpsertStorageRecordCommand(key, value.GetRawText()), cancellationToken);
        return NoContent();
    }

    [HttpDelete("{key}")]
    public async Task<IActionResult> Delete(string key, CancellationToken cancellationToken)
    {
        var deleted = await sender.Send(new DeleteStorageRecordCommand(key), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("import")]
    [Consumes("application/json")]
    public async Task<IActionResult> Import([FromBody] Dictionary<string, JsonElement>? values, CancellationToken cancellationToken)
    {
        if (values is null)
            return BadRequest(new ProblemDetails { Title = "A JSON object of storage records is required." });

        var records = values.ToDictionary(pair => pair.Key, pair => pair.Value.GetRawText());
        await sender.Send(new ReplaceStorageRecordsCommand(records), cancellationToken);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken cancellationToken)
    {
        await sender.Send(new ClearStorageCommand(), cancellationToken);
        return NoContent();
    }

    private static JsonElement ParseJson(string value)
    {
        using var document = JsonDocument.Parse(value);
        return document.RootElement.Clone();
    }
}
