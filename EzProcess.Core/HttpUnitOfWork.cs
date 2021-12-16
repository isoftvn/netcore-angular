using EzProcess.Caching;
using EzProcess.Core.Identity;
using Microsoft.AspNetCore.Http;

namespace EzProcess.Core
{
    public class HttpUnitOfWork : UnitOfWork
    {
        public HttpUnitOfWork(ApplicationDbContext context, IHttpContextAccessor httpAccessor, ICacheBase cache) : base(context, cache)
        {
            context.CurrentUserId = httpAccessor.HttpContext?.User.FindFirst(ClaimConstants.Subject)?.Value?.Trim();
        }
    }
}
