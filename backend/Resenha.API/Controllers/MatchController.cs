using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Matches;
using Resenha.API.Services;
using System.Security.Claims;

namespace Resenha.API.Controllers
{
    [ApiController]
    [Authorize]
    public class MatchController : ControllerBase
    {
        private readonly MatchService _matchService;

        public MatchController(MatchService matchService)
        {
            _matchService = matchService;
        }

        private ulong GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return ulong.Parse(claim!);
        }

        // POST /api/matches
        // Admin cria uma partida. Temporada ATIVA é criada automaticamente se necessário.
        [HttpPost("api/matches")]
        public IActionResult CreateMatch([FromBody] CreateMatchDTO dto)
        {
            try
            {
                var response = _matchService.CreateMatch(GetUserId(), dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // GET /api/groups/{groupId}/matches
        // Lista partidas do grupo com status de presença do usuário logado.
        [HttpGet("api/groups/{groupId}/matches")]
        public IActionResult GetGroupMatches(ulong groupId)
        {
            try
            {
                var response = _matchService.GetGroupMatches(GetUserId(), groupId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // POST /api/matches/{id}/confirm
        // Confirma presença na partida. Bloqueado quando limite de jogadores é atingido.
        [HttpPost("api/matches/{id}/confirm")]
        public IActionResult ConfirmPresence(ulong id)
        {
            try
            {
                var response = _matchService.ConfirmPresence(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // DELETE /api/matches/{id}/confirm
        // Cancela presença na partida (somente se ABERTA).
        [HttpDelete("api/matches/{id}/confirm")]
        public IActionResult CancelPresence(ulong id)
        {
            try
            {
                var response = _matchService.CancelPresence(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // POST /api/matches/{id}/absent
        // Marca ausência explícita ("não posso ir") na partida.
        [HttpPost("api/matches/{id}/absent")]
        public IActionResult MarkAbsent(ulong id)
        {
            try
            {
                var response = _matchService.MarkAbsent(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // DELETE /api/matches/{id}/absent
        // Remove ausência (volta ao neutro).
        [HttpDelete("api/matches/{id}/absent")]
        public IActionResult CancelAbsent(ulong id)
        {
            try
            {
                var response = _matchService.CancelAbsent(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}
