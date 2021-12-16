using IdentityModel;
using System.Linq;
using System.Security.Claims;

namespace EzProcess.Helpers
{
    public static class IdentityHelper
    {
        public static string GetUserId(ClaimsPrincipal user)
        {
            return user.FindFirst(JwtClaimTypes.Subject)?.Value?.Trim();
        }

        public static string GetUserName(ClaimsPrincipal user)
        {
            return user.FindFirst(JwtClaimTypes.Name)?.Value?.Trim();
        }

        public static string[] GetRoles(ClaimsPrincipal identity)
        {
            return identity.Claims
                .Where(c => c.Type == JwtClaimTypes.Role)
                .Select(c => c.Value)
                .ToArray();
        }
    }
}
