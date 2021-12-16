using AutoMapper;
using EzProcess.Core;
using EzProcess.Core.Models;
using EzProcess.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EzProcess.ViewModels.ValueResolvers
{
	public class UpdatedByValueResolver<TSource, TDestination> : IValueResolver<TSource, TDestination, string>
	{
		private IUnitOfWork _unitOfWork;

		public UpdatedByValueResolver(IUnitOfWork unitOfWork)
		{
			_unitOfWork = unitOfWork;
		}
		public string Resolve(TSource source, TDestination destination, string destMember, ResolutionContext context)
		{
			Guid updatedByGuid = Guid.Empty;
			object updatedByValue = source.GetValueByNameRecursive("UpdatedBy");
			if (updatedByValue != null)
			{
				IEnumerable<ApplicationUser> allUsers = _unitOfWork.Cache.GetUsersAsync().Result;
				return allUsers.FirstOrDefault(x => x.Id.EqualsIgnoreCase(updatedByValue.ToString()))?.FullName;
			}
			return null;
		}
	}
}
