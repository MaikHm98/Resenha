using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Matches;
using Resenha.API.Helpers;
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
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
            }
        }

        // GET /api/groups/{groupId}/matches/history
        // Retorna o historico resumido das partidas do grupo.
        [HttpGet("api/groups/{groupId}/matches/history")]
        public IActionResult GetGroupMatchHistory(ulong groupId)
        {
            try
            {
                var response = _matchService.GetGroupMatchHistory(GetUserId(), groupId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // GET /api/matches/{id}/details
        // Retorna o detalhe completo da partida, com placar, capitaes, times e estatisticas.
        [HttpGet("api/matches/{id}/details")]
        public IActionResult GetMatchDetails(ulong id)
        {
            try
            {
                var response = _matchService.GetMatchDetails(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        [HttpGet("api/matches/{id}/challenge-status")]
        public IActionResult GetChallengeStatus(ulong id)
        {
            try
            {
                var response = _matchService.GetChallengeStatus(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        [HttpPost("api/matches/{id}/challenge/line-draw/start")]
        public IActionResult StartLineDraw(ulong id, [FromBody] IniciarParImparLinhaDTO dto)
        {
            try
            {
                var response = _matchService.StartLineDraw(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        [HttpPost("api/matches/{id}/challenge/line-draw/number")]
        public IActionResult SubmitLineDrawNumber(ulong id, [FromBody] RegistrarNumeroParImparLinhaDTO dto)
        {
            try
            {
                var response = _matchService.SubmitLineDrawNumber(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        [HttpPost("api/matches/{id}/challenge/line-picks")]
        public IActionResult PickLinePlayer(ulong id, [FromBody] EscolherJogadorLinhaDTO dto)
        {
            try
            {
                var response = _matchService.PickLinePlayer(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        [HttpPost("api/matches/{id}/challenge/goalkeeper-draw/start")]
        public IActionResult StartGoalkeeperDraw(ulong id, [FromBody] IniciarParImparGoleiroDTO dto)
        {
            try
            {
                var response = _matchService.StartGoalkeeperDraw(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        [HttpPost("api/matches/{id}/challenge/goalkeeper-draw/number")]
        public IActionResult SubmitGoalkeeperDrawNumber(ulong id, [FromBody] RegistrarNumeroParImparGoleiroDTO dto)
        {
            try
            {
                var response = _matchService.SubmitGoalkeeperDrawNumber(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        [HttpPost("api/matches/{id}/challenge/goalkeeper-pick")]
        public IActionResult PickGoalkeeper(ulong id, [FromBody] EscolherGoleiroDTO dto)
        {
            try
            {
                var response = _matchService.PickGoalkeeper(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
            }
        }

        // DELETE /api/matches/{id}
        // Admin exclui a partida e os dados vinculados.
        [HttpDelete("api/matches/{id}")]
        public IActionResult DeleteMatch(ulong id)
        {
            try
            {
                _matchService.DeleteMatch(GetUserId(), id);
                return Ok(new { mensagem = "Partida excluida com sucesso." });
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/matches/{id}/guests
        // Admin adiciona um convidado diretamente na lista da partida.
        [HttpPost("api/matches/{id}/guests")]
        public IActionResult AddGuest(ulong id, [FromBody] AddGuestToMatchDTO dto)
        {
            try
            {
                var response = _matchService.AddGuestToMatch(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }
    }
}
