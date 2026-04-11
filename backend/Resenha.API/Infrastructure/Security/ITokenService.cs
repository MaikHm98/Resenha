using Resenha.API.Entities;

namespace Resenha.API.Infrastructure.Security
{
    public interface ITokenService
    {
        string GenerateAccessToken(Usuario usuario);
        string GenerateRefreshToken();
        string HashToken(string token);
    }
}
