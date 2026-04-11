using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Resenha.API.Data;
using Xunit;

namespace Resenha.API.Tests;

public class HealthCheckTests
{
    [Fact]
    public async Task Health_DeveResponderOkQuandoApiInicializa()
    {
        await using var factory = new ResenhaApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        response.EnsureSuccessStatusCode();
        Assert.Equal("text/plain", response.Content.Headers.ContentType?.MediaType);
    }

    private sealed class ResenhaApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("DataSource=:memory:");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = "Host=127.0.0.1;Port=5432;Database=resenha_test;Username=resenha_test;Password=resenha_test",
                    ["JwtSettings:SecretKey"] = "ResenhaTestJwtSecretKeyComMinimo32Caracteres",
                    ["JwtSettings:Issuer"] = "ResenhaAPI",
                    ["JwtSettings:Audience"] = "ResenhaWeb",
                    ["JwtSettings:ExpirationMinutes"] = "1440",
                    ["EmailSettings:Provider"] = "resend",
                    ["EmailSettings:FromEmail"] = "nao-responda@resenha.local",
                    ["EmailSettings:FromName"] = "Resenha"
                });
            });

            builder.ConfigureServices(services =>
            {
                _connection.Open();

                services.RemoveAll<DbContextOptions<ResenhaDbContext>>();
                services.AddDbContext<ResenhaDbContext>(options =>
                    options.UseSqlite(_connection));

                using var provider = services.BuildServiceProvider();
                using var scope = provider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ResenhaDbContext>();
                context.Database.EnsureCreated();
            });
        }

        public override async ValueTask DisposeAsync()
        {
            await _connection.DisposeAsync();
            await base.DisposeAsync();
        }
    }
}
