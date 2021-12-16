using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace EzProcess.Core.Models
{
    public class NewsTag : BaseModel<Guid>
    {
        public NewsTag()
        {
            Id = Guid.NewGuid();
        }
        [MaxLength(64)]
        public string TagName { get; set; }

        public virtual ICollection<NewsArticleTag> ArticleTags { get; set; }
    }
}
