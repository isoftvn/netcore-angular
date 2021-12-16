using EzProcess.Core.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace EzProcess.Core.Repositories.Interfaces
{
    public interface INewsRepository
    {
        Task<(bool Succeeded, object Result)> CreateCategoryAsync(NewsCategory entity);
        Task<(bool Succeeded, object Result)> DeleteCategoryAsync(string objectId);
        Task<(bool Succeeded, object Result)> UpdateCategoryAsync(NewsCategory entity);
        Task<IEnumerable<NewsTag>> GetTagsAsync(string articleID = null);
        Task<(bool Succeeded, object Result)> CreateTagAsync(NewsTag entity);
        Task<(bool Succeeded, object Result)> DeleteTagAsync(string objectId);
        Task<(bool Succeeded, object Result)> UpdateTagAsync(NewsTag entity);
        Task<IEnumerable<NewsComment>> GetCommentsAsync(string articleId = null);
        Task<IEnumerable<NewsArticle>> GetAnnoucementArtitlesAsync();
        Task<IEnumerable<NewsArticle>> GetArtitlesAsync(int pageIndex, int pageSize, string categoryId = null, bool includeUnPublish = false);
        Task<NewsArticle> GetNewsArtitleAsync(string entityId);
        Task<(bool Succeeded, object Result)> CreateCommentAsync(NewsComment entity);
        Task<(bool Succeeded, object Result)> CreateArticleAsync(NewsArticle entity, Guid[] categoryId, string[] tags);
        Task<(bool Succeeded, object Result)> UpdateArticleAsync(NewsComment entity);
        Task<(bool Succeeded, object Result)> PublishArticleAsync(string entityId);
    }
}
