using System.Security.Cryptography;
using System.Text;

namespace Resenha.API.Helpers
{
    // Utilitário para hash e verificação de senhas
    public static class PasswordHelper
    {
        // Gera hash SHA256 da senha — nunca armazenamos a senha em texto puro
        public static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        // Verifica se a senha informada confere com o hash armazenado
        public static bool VerifyPassword(string password, string storedHash)
        {
            var hash = HashPassword(password);
            return hash == storedHash;
        }
    }
}
