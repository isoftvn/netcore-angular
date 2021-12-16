using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace EzProcess.Core.Models
{
    public class NewsArticleCategory
    {
        public Guid ArticleID { get; set; }
        public Guid CategoryID { get; set; }
        public NewsArticle Article { get; set; }
        public NewsCategory Category { get; set; }
    }
}
