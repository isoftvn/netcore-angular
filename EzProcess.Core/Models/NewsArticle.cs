using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace EzProcess.Core.Models
{
    public class NewsArticle : BaseModel<Guid>
    {
        public NewsArticle()
        {
            Id = Guid.NewGuid();
            Status = false;
            IsCommentEnabled = false;
            IsAnnoucement = false;
        }

        [MaxLength(256)]
        public string ImageUrl { get; set; }

        [MaxLength(256)]
        [Required]
        public string Title { get; set; }

        [MaxLength(256)]
        [Required]
        public string Slug { get; set; }

        public string Content { get; set; }
        
        public bool Status { get; set; }
        
        public bool IsCommentEnabled { get; set; }

        public bool IsAnnoucement { get; set; }

        public virtual ICollection<NewsArticleTag> ArticleTags { get; set; }

        public virtual ICollection<NewsArticleCategory> ArticleCategories { get; set; }
    }
}
