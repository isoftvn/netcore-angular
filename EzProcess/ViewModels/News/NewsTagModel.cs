using System;
using System.ComponentModel.DataAnnotations;

namespace EzProcess.ViewModels
{
    public class NewsTagModel
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "TagName is required"), StringLength(64, MinimumLength = 2, ErrorMessage = "TagName must be between 2 and 64 characters")]
        public string TagName { get; set; }

        public string CreatedBy { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}
