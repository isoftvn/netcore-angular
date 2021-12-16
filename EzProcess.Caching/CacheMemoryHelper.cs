using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Text;

namespace EzProcess.Caching
{
    public class CacheMemoryHelper : ICacheBase
    {
        private IMemoryCache _cache;

        public CacheMemoryHelper(IMemoryCache cache)
        {
            this._cache = cache;
        }

        public void Add<T>(T o, string key)
        {
            T cacheEntry;
            // Look for cache key.
            if (!_cache.TryGetValue(key, out cacheEntry))
            {
                // Key not in cache, so get data.
                cacheEntry = o;
                // Set cache options.
                var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromDays(1));
                // Save data in cache.
                _cache.Set(key, cacheEntry, cacheEntryOptions);
            }
        }

        public T Get<T>(string key)
        {
            return _cache.Get<T>(key);
        }

        public void Remove(string key)
        {
            _cache.Remove(key);
        }
    }
}
