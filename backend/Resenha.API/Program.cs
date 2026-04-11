using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Resenha.API.Data;
using Resenha.API.Infrastructure.Email;
using Resenha.API.Infrastructure.HealthChecks;
using Resenha.API.Infrastructure.Security;
using Resenha.API.Services;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var environment = builder.Environment;

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' nao configurada.");

builder.Services.AddDbContext<ResenhaDbContext>(options =>
    options.UseNpgsql(connectionString));

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JwtSettings:SecretKey nao configurado.");

if (secretKey.Length < 32)
    throw new InvalidOperationException("JwtSettings:SecretKey deve ter no minimo 32 caracteres.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var pwdAtClaim = context.Principal?.FindFirst("pwd_at")?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || string.IsNullOrWhiteSpace(pwdAtClaim))
            {
                context.Fail("Token invalido.");
                return;
            }

            if (!ulong.TryParse(userIdClaim, out var userId))
            {
                context.Fail("Token invalido.");
                return;
            }

            var db = context.HttpContext.RequestServices.GetRequiredService<ResenhaDbContext>();
            var usuario = await db.Usuarios.FindAsync(userId);
            if (usuario == null || !usuario.Ativo)
            {
                context.Fail("Usuario invalido.");
                return;
            }

            var pwdDate = usuario.AtualizadoEm ?? usuario.CriadoEm;
            var pwdUtc = pwdDate.Kind == DateTimeKind.Utc
                ? pwdDate
                : DateTime.SpecifyKind(pwdDate, DateTimeKind.Utc);
            var currentPwdAt = new DateTimeOffset(pwdUtc).ToUnixTimeSeconds().ToString();
            if (pwdAtClaim != currentPwdAt)
            {
                context.Fail("Sessao expirada. Faca login novamente.");
            }
        }
    };
});

builder.Services.AddAuthorization();

var corsOrigins = builder.Configuration
    .GetSection("CorsSettings:AllowedOrigins")
    .Get<string[]>()?
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim())
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCors", policy =>
    {
        if (environment.IsDevelopment())
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        if (corsOrigins.Length == 0)
            return;

        policy
            .WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddHttpClient();
builder.Services.AddScoped<IEmailSender, ResendEmailSender>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IInviteEmailService, InviteEmailService>();
builder.Services.AddScoped<GroupService>();
builder.Services.AddScoped<MatchService>();
builder.Services.AddScoped<CaptainService>();
builder.Services.AddScoped<ClassificationService>();
builder.Services.AddScoped<VoteService>();
builder.Services
    .AddHealthChecks()
    .AddCheck<BancoDadosHealthCheck>("banco_dados", HealthStatus.Unhealthy);

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var firstError = context.ModelState
                .Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault();

            return new BadRequestObjectResult(new
            {
                mensagem = string.IsNullOrWhiteSpace(firstError) ? "Dados invalidos." : firstError
            });
        };
    });
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Resenha API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT assim: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", document, null),
            new List<string>()
        }
    });
});

var app = builder.Build();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors("AppCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapHealthChecks("/ready");
app.MapControllers();

app.Run();

public partial class Program { }
