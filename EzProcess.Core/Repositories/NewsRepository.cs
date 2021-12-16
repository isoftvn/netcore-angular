using EzProcess.Utils.Extensions;
using EzProcess.Core.Models;
using EzProcess.Core.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EzProcess.Caching;
using Newtonsoft.Json;

namespace EzProcess.Core.Repositories
{
    public class NewsRepository : Repository<NewsArticle>, INewsRepository
    {
        private ICacheBase _cache;
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public NewsRepository(ApplicationDbContext context, ICacheBase cache) : base(context)
        {
            _cache = cache;
        }

        public async Task<(bool Succeeded, object Result)> CreateCategoryAsync(NewsCategory entity)
        {
            _cache.Remove(CacheKeys.AllCategories);
            await _appContext.NewsCategories.AddAsync(entity);

            int effect = await _appContext.SaveChangesAsync();
            if (effect > 0)
            {
                return (true, entity);
            }
            return (false, JsonConvert.SerializeObject(entity));
        }


        public async Task<(bool Succeeded, object Result)> UpdateCategoryAsync(NewsCategory entity)
        {
            _cache.Remove(CacheKeys.AllCategories);
            NewsCategory oldItem = _appContext.NewsCategories.FirstOrDefault(x => x.Id.Equals(entity.Id));
            if (oldItem != null)
            {
                oldItem.CategoryName = entity.CategoryName;
                oldItem.Description = entity.Description;
                oldItem.IsDeleted = entity.IsDeleted;
                oldItem.ParentCategory = entity.ParentCategory;
                await _appContext.SaveChangesAsync();
                return (true, oldItem);
            }
            return (false, "Category not found!");
        }

        public async Task<(bool Succeeded, object Result)> DeleteCategoryAsync(string objectId)
        {
            _cache.Remove(CacheKeys.AllCategories);
            NewsCategory oldItem = _appContext.NewsCategories.FirstOrDefault(x => x.Id.Equals(Guid.Parse(objectId)));
            if (oldItem != null)
            {
                oldItem.IsDeleted = true;
                await _appContext.SaveChangesAsync();
                return (true, objectId);
            }
            return (false, "Category not found!");
        }

        public Task<IEnumerable<NewsTag>> GetTagsAsync(string articleID = null)
        {
            throw new NotImplementedException();
        }

        public async Task<(bool Succeeded, object Result)> CreateTagAsync(NewsTag entity)
        {
            _cache.Remove(CacheKeys.AllTags);
            await _appContext.NewsTags.AddAsync(entity);
            int effect = await _appContext.SaveChangesAsync();
            if (effect > 0)
            {
                return (true, entity);
            }
            return (false, JsonConvert.SerializeObject(entity));
        }

        public async Task<(bool Succeeded, object Result)> DeleteTagAsync(string objectId)
        {
            _cache.Remove(CacheKeys.AllTags);
            NewsTag oldItem = _appContext.NewsTags.FirstOrDefault(x => x.Id.Equals(Guid.Parse(objectId)));
            if (oldItem != null)
            {
                IEnumerable<NewsArticleTag> oldRelated = _appContext.NewsArticleTags.Where(x => x.TagID.Equals(objectId));
                if (oldRelated.Count() > 0)
                {
                    _appContext.NewsArticleTags.RemoveRange(oldRelated);
                }
                _appContext.NewsTags.Remove(oldItem);
                await _appContext.SaveChangesAsync();
                return (true, objectId);
            }
            return (false, "Tag not found!");
        }

        public async Task<(bool Succeeded, object Result)> UpdateTagAsync(NewsTag entity)
        {
            _cache.Remove(CacheKeys.AllTags);
            NewsTag oldItem = _appContext.NewsTags.FirstOrDefault(x => x.Id.Equals(entity.Id));
            if (oldItem != null)
            {
                oldItem.TagName = entity.TagName;
                await _appContext.SaveChangesAsync();
                return (true, oldItem);
            }
            return (false, "Tag not found!");
        }

        public async Task<IEnumerable<NewsComment>> GetCommentsAsync(string articleId = null)
        {
            if (!string.IsNullOrEmpty(articleId))
            {
                return await _appContext.NewsComments.Where(x => x.Article.Id.Equals(articleId)).ToListAsync();
            }
            return await _appContext.NewsComments.ToListAsync();
        }

        public async Task<IEnumerable<NewsArticle>> GetAnnoucementArtitlesAsync()
        {
            return await _appContext.NewsArticles.Where(x => x.IsAnnoucement).ToListAsync();
        }

        public Task<IEnumerable<NewsArticle>> GetArtitlesAsync(int pageIndex, int pageSize, string categoryId = null, bool includeUnPublish = false)
        {
            throw new NotImplementedException();
        }

        public async Task<NewsArticle> GetNewsArtitleAsync(string entityId)
        {
            return await _appContext.NewsArticles.FindAsync(entityId);
        }

        public async Task<(bool Succeeded, object Result)> CreateCommentAsync(NewsComment entity)
        {
            await _appContext.NewsComments.AddAsync(entity);

            int effect = await _appContext.SaveChangesAsync();
            if (effect > 0)
            {
                return (true, entity);
            }
            return (false, new string[] { JsonConvert.SerializeObject(entity) });
        }

        public async Task<(bool Succeeded, object Result)> CreateArticleAsync(NewsArticle entity, Guid[] categoryId, string[] tagNames)
        {
            IEnumerable<NewsCategory> categories = _appContext.NewsCategories.Where(x => categoryId.Contains(x.Id));
            IEnumerable<NewsTag> tags = _appContext.NewsTags.Where(x => tagNames.Contains(x.TagName));
            if (categories != null && categories.Count() > 0)
            {
                entity.Slug = entity.Title.GenerateSlug();
                entity.ArticleCategories = new List<NewsArticleCategory>();
                foreach (NewsCategory item in categories)
                {
                    entity.ArticleCategories.Add(new NewsArticleCategory
                    {
                        Category = item,
                        Article = entity
                    });
                }
                entity.ArticleTags = new List<NewsArticleTag>();
                foreach (NewsTag item in tags)
                {
                    entity.ArticleTags.Add(new NewsArticleTag
                    {
                        Tag = item,
                        Article = entity
                    });
                }
                var added = await _appContext.NewsArticles.AddAsync(entity);
                int effect = await _appContext.SaveChangesAsync();
                if (added.Entity.Id != Guid.Empty && effect > 0)
                {
                    return (true, entity);
                }
            }
            return (false, new string[] { "NewsCategory not found" });
        }

        public Task<(bool Succeeded, object Result)> UpdateArticleAsync(NewsComment entity)
        {
            throw new NotImplementedException();
        }

        public Task<(bool Succeeded, object Result)> PublishArticleAsync(string entityId)
        {
            throw new NotImplementedException();
        }
    }
}
