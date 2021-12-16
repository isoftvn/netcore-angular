using System;
using System.ComponentModel.DataAnnotations;

namespace EzProcess.ViewModels
{
    public class NewsCategoryModel
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "CategoryName is required"), StringLength(64, MinimumLength = 2, ErrorMessage = "CategoryName must be between 2 and 64 characters")]
        public string CategoryName { get; set; }

        [StringLength(128, ErrorMessage = "Description must be smaller than 2048 characters")]
        public string Description { get; set; }

        public bool IsDeleted { get; set; }

        [MaxLength(36)]
        public string ParentCategory { get; set; }
        public string ParentCategoryName { get; set; }

        public string CreatedBy { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}
