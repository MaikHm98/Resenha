using Microsoft.Extensions.Diagnostics.HealthChecks;
using Resenha.API.Data;

namespace Resenha.API.Infrastructure.HealthChecks
{
    public class BancoDadosHealthCheck : IHealthCheck
    {
        private readonly ResenhaDbContext _context;

        public BancoDadosHealthCheck(ResenhaDbContext context)
        {
            _context = context;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
                return canConnect
                    ? HealthCheckResult.Healthy("Banco de dados acessivel.")
                    : HealthCheckResult.Unhealthy("Banco de dados inacessivel.");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Falha ao verificar banco de dados.", ex);
            }
        }
    }
}
