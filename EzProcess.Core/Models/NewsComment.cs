using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace EzProcess.Core.Models
{
    public class NewsComment : BaseModel<Guid>
    {
        public NewsComment()
        {
            Id = Guid.NewGuid();
            Status = false;
        }

        public NewsArticle Article { get; set; }

        [MaxLength(1024)]
        [Required]
        public string Content { get; set; }

        [MaxLength(256)]
        [Required]
        public string DisplayName { get; set; }

        [MaxLength(256)]
        [Required]
        public string Email { get; set; }

        public bool Status { get; set; }
    }
}
