using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace EzProcess.Core.Models
{
    public class NewsCategory : BaseModel<Guid>
    {
        public NewsCategory()
        {
            Id = Guid.NewGuid();
            IsDeleted = false;
        }

        [MaxLength(64)]
        [Required]
        public string CategoryName { get; set; }
        
        [MaxLength(128)]
        public string Description { get; set; }

        public bool IsDeleted { get; set; }

        [MaxLength(36)]
        public string ParentCategory { get; set; }

        public virtual ICollection<NewsArticleCategory> ArticleCategories { get; set; }
    }
}
