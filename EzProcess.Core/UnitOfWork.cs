using EzProcess.Caching;
using EzProcess.Core.Repositories;
using EzProcess.Core.Repositories.Interfaces;

namespace EzProcess.Core
{
    public class UnitOfWork : IUnitOfWork
    {
        readonly ApplicationDbContext _context;
        private ICacheBase _cache;
        INewsRepository _news;
        ApplicationCache _appCache;

        public UnitOfWork(ApplicationDbContext context, ICacheBase cache)
        {
            _context = context;
            _cache = cache;
        }

        public ApplicationCache Cache
        {
            get
            {
                if (_appCache == null)
                    _appCache = new ApplicationCache(_context, _cache);
                return _appCache;
            }
        }

        public INewsRepository News
        {
            get
            {
                if (_news == null)
                    _news = new NewsRepository(_context, _cache);
                return _news;
            }
        }

        public int SaveChanges()
        {
            return _context.SaveChanges();
        }
    }
}
