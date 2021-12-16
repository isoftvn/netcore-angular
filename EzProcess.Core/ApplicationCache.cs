using EzProcess.Caching;
using EzProcess.Core.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EzProcess.Core
{
    public class ApplicationCache
    {
        private readonly ApplicationDbContext _appContext;
        private readonly ICacheBase _cache;
        public ApplicationCache(ApplicationDbContext context, ICacheBase cache)
        {
            _appContext = context;
            _cache = cache;
        }

        public async Task<IEnumerable<NewsCategory>> GetNewsCategoriesAsync(bool includeDeleted = false)
        {
            IEnumerable<NewsCategory> cacheResult = _cache.Get<IEnumerable<NewsCategory>>(CacheKeys.AllCategories); 
            if (cacheResult == null)
            {
                cacheResult = await _appContext.NewsCategories.ToListAsync();
                _cache.Add(cacheResult, CacheKeys.AllCategories);
            }
            if(!includeDeleted)
            {
                cacheResult = cacheResult.Where(x => !x.IsDeleted);
            }
            return cacheResult;
        }

        public async Task<IEnumerable<ApplicationUser>> GetUsersAsync()
        {
            IEnumerable<ApplicationUser> cacheResult = _cache.Get<IEnumerable<ApplicationUser>>(CacheKeys.AllUsers);
            if (cacheResult == null)
            {
                cacheResult = await _appContext.Users

                    .Include(u => u.Claims)
                    .Include(u => u.Roles)
                    .OrderBy(u => u.UserName)
                    .ToListAsync();
                _cache.Add(cacheResult, CacheKeys.AllUsers);
            }
            return cacheResult;
        }

        public async Task<IEnumerable<ApplicationRole>> GetRolesAsync()
        {
            IEnumerable<ApplicationRole> cacheResult = _cache.Get<IEnumerable<ApplicationRole>>(CacheKeys.AllRoles);
            if (cacheResult == null)
            {
                cacheResult = await _appContext.Roles
                    .Include(r => r.Claims)
                    .Include(r => r.Users)
                    .OrderBy(r => r.Name)
                    .ToListAsync();
                _cache.Add(cacheResult, CacheKeys.AllRoles);
            }
            return cacheResult;
        }

        public async Task<IEnumerable<NewsTag>> GetNewsTagsAsync()
        {
            IEnumerable<NewsTag> cacheResult = _cache.Get<IEnumerable<NewsTag>>(CacheKeys.AllTags);
            if (cacheResult == null)
            {
                cacheResult = await _appContext.NewsTags.ToListAsync();
                _cache.Add(cacheResult, CacheKeys.AllTags);
            }
            return cacheResult;
        }
    }
}
