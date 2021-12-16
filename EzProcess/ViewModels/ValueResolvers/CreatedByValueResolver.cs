using AutoMapper;
using EzProcess.Core;
using EzProcess.Core.Models;
using EzProcess.Utils.Extensions;
using System.Collections.Generic;
using System.Linq;

namespace EzProcess.ViewModels.ValueResolvers
{
    public class CreatedByValueResolver<TSource, TDestination> : IValueResolver<TSource, TDestination, string>
	{
		private IUnitOfWork _unitOfWork;

		public CreatedByValueResolver(IUnitOfWork unitOfWork)
		{
			_unitOfWork = unitOfWork;
		}
		public string Resolve(TSource source, TDestination destination, string destMember, ResolutionContext context)
		{
			object createdByValue = source.GetValueByNameRecursive("CreatedBy");
			if (createdByValue != null)
			{
				IEnumerable<ApplicationUser> allUsers = _unitOfWork.Cache.GetUsersAsync().Result;
				return allUsers.FirstOrDefault(x => x.Id.EqualsIgnoreCase(createdByValue.ToString()))?.FullName;
			}
			return null;
		}
	}
}
