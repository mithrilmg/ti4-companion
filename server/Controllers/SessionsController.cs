using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using server.Domain;
using server.Persistence;
using server.Infra;
using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly ILogger<SessionsController> _logger;
        private readonly SessionContext _sessionContext;
        private readonly ITimeProvider _timeProvider;
        private readonly IConfiguration _configuration;

        public SessionsController(
            ILogger<SessionsController> logger,
            SessionContext sessionContext,
            ITimeProvider timeProvider,
            IConfiguration configuration
        )
        {
            _logger = logger;
            _sessionContext = sessionContext;
            _timeProvider = timeProvider;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<ActionResult<Session>> Post(List<string> factions)
        {
            var sessionId = Guid.NewGuid();
            var newSession = new Session { Id = sessionId, CreatedAt = _timeProvider.Now };
            newSession.Events = new List<GameEvent> {
                new GameEvent {
                    Id = Guid.NewGuid(),
                    SessionId = sessionId,
                    HappenedAt = _timeProvider.Now,
                    EventType = GameEvent.GameStarted,
                    SerializedPayload = JsonConvert.SerializeObject(factions)
                }
            };
            await _sessionContext.Sessions.AddAsync(newSession);
            await _sessionContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSession), new { id = newSession.Id }, new SessionDto(newSession));
        }

        [HttpGet]
        public async Task<IEnumerable<SessionDto>> GetSessions()
        {
            var sessionsFromDb = await _sessionContext.Sessions.OrderByDescending(session => session.CreatedAt).ToListAsync();

            return sessionsFromDb.Select(fromDb => new SessionDto(fromDb));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SessionDto>> GetSession(Guid id)
        {
            var sessionFromDb = await _sessionContext.Sessions.FindAsync(id);
            _sessionContext.Entry(sessionFromDb)
                .Collection(session => session.Events)
                .Load();

            if (sessionFromDb == null)
            {
                return new NotFoundResult();
            }

            return new SessionDto(sessionFromDb);
        }

        // TODO not cool, direct Events and stuff
        [HttpPost("{id}/map")]
        public async Task<ActionResult> UploadMap(Guid id)
        {
            var mapFile = HttpContext.Request.Form.Files["map"];

            if (mapFile.Length > 3000000) {
                return new BadRequestResult();
            }

            var sessionBlobContainer = new BlobContainerClient(_configuration.GetConnectionString("BlobStorage"), id.ToString());
            await sessionBlobContainer.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var mapBlobClient = sessionBlobContainer.GetBlobClient("map");
            var blobHttpHeader = new BlobHttpHeaders();
            blobHttpHeader.ContentType = mapFile.ContentType;
            await mapBlobClient.UploadAsync(mapFile.OpenReadStream(), blobHttpHeader);

            var gameEvent = new GameEvent{
                Id = Guid.NewGuid(),
                SessionId = id,
                HappenedAt = _timeProvider.Now,
                EventType = GameEvent.MapAdded,
                SerializedPayload = mapBlobClient.Uri.ToString(),
            };
            await _sessionContext.Events.AddAsync(gameEvent);
            await _sessionContext.SaveChangesAsync();

            return new OkResult();
        }
    }
}
