using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace EzProcess.Core.Models
{
    public class NewsArticleTag
    {
        public Guid ArticleID { get; set; }
        public Guid TagID { get; set; }
        public NewsArticle Article { get; set; }
        public NewsTag Tag { get; set; }
    }
}
