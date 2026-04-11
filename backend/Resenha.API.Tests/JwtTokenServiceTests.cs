using Microsoft.Extensions.Configuration;
using Resenha.API.Entities;
using Resenha.API.Infrastructure.Security;
using Xunit;

namespace Resenha.API.Tests;

public class JwtTokenServiceTests
{
    [Fact]
    public void GenerateRefreshToken_DeveCriarValorSeguroEHashavel()
    {
        var service = new JwtTokenService(CriarConfiguracao());

        var refreshToken = service.GenerateRefreshToken();
        var hash = service.HashToken(refreshToken);

        Assert.False(string.IsNullOrWhiteSpace(refreshToken));
        Assert.DoesNotContain("+", refreshToken);
        Assert.DoesNotContain("/", refreshToken);
        Assert.Equal(64, hash.Length);
    }

    [Fact]
    public void GenerateAccessToken_DeveGerarJwtParaUsuario()
    {
        var service = new JwtTokenService(CriarConfiguracao());
        var usuario = new Usuario
        {
            IdUsuario = 1,
            Nome = "Jogador Teste",
            Email = "jogador@teste.com",
            CriadoEm = DateTime.UtcNow
        };

        var token = service.GenerateAccessToken(usuario);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(3, token.Split('.').Length);
    }

    private static IConfiguration CriarConfiguracao()
        => new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "ResenhaTestJwtSecretKeyComMinimo32Caracteres",
                ["JwtSettings:Issuer"] = "ResenhaAPI",
                ["JwtSettings:Audience"] = "ResenhaWeb",
                ["JwtSettings:ExpirationMinutes"] = "1440"
            })
            .Build();
}
