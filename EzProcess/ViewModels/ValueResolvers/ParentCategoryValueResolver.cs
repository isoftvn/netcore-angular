using AutoMapper;
using EzProcess.Core;
using EzProcess.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EzProcess.ViewModels.ValueResolvers
{
    public class ParentCategoryValueResolver : IValueResolver<NewsCategory, NewsCategoryModel, string>
	{
		private IUnitOfWork _unitOfWork;

		public ParentCategoryValueResolver(IUnitOfWork unitOfWork)
		{
			_unitOfWork = unitOfWork;
		}
		public string Resolve(NewsCategory source, NewsCategoryModel destination, string destMember, ResolutionContext context)
		{
			Guid parentCategoryGuid = Guid.Empty;
			if (source.ParentCategory != null && Guid.TryParse(source.ParentCategory, out parentCategoryGuid))
			{
				IEnumerable<NewsCategory> allCategories = _unitOfWork.Cache.GetNewsCategoriesAsync().Result;
				return allCategories.FirstOrDefault(x => x.Id.Equals(parentCategoryGuid))?.CategoryName;
			}
			return null;
		}
	}
}
