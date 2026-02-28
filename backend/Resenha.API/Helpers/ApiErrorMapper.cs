using Microsoft.AspNetCore.Mvc;

namespace Resenha.API.Helpers
{
    public static class ApiErrorMapper
    {
        public static IActionResult ToErrorResult(this ControllerBase controller, Exception ex)
        {
            var message = ex.Message ?? "Erro inesperado.";
            var lower = message.ToLowerInvariant();

            var statusCode = StatusCodes.Status400BadRequest;

            if (lower.Contains("não encontrado") || lower.Contains("nao encontrado"))
            {
                statusCode = StatusCodes.Status404NotFound;
            }
            else if (
                lower.Contains("não é membro") ||
                lower.Contains("nao e membro") ||
                lower.Contains("apenas administradores") ||
                lower.Contains("não pertence ao seu email") ||
                lower.Contains("nao pertence ao seu email")
            )
            {
                statusCode = StatusCodes.Status403Forbidden;
            }
            else if (
                lower.Contains("já") ||
                lower.Contains("ja") ||
                lower.Contains("limite") ||
                lower.Contains("vagas encerradas") ||
                lower.Contains("votação em andamento") ||
                lower.Contains("votacao em andamento")
            )
            {
                statusCode = StatusCodes.Status409Conflict;
            }

            return new ObjectResult(new { mensagem = message })
            {
                StatusCode = statusCode
            };
        }
    }
}
