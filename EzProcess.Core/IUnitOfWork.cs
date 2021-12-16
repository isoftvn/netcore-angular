using EzProcess.Core.Repositories.Interfaces;

namespace EzProcess.Core
{
    public interface IUnitOfWork
    {
        INewsRepository News { get; }

        ApplicationCache Cache { get; }

        int SaveChanges();
    }
}
