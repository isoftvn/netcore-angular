using AutoMapper;
using EzProcess.Core.Identity;
using EzProcess.Core.Models;
using EzProcess.ViewModels.Identity;
using EzProcess.ViewModels.ValueResolvers;
using Microsoft.AspNetCore.Identity;

namespace EzProcess.ViewModels
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<ApplicationUser, UserViewModel>()
                .ForMember(d => d.Roles, map => map.Ignore());
            CreateMap<UserViewModel, ApplicationUser>()
                .ForMember(d => d.Roles, map => map.Ignore());

            CreateMap<ApplicationUser, UserEditViewModel>()
                .ForMember(d => d.Roles, map => map.Ignore());
            CreateMap<UserEditViewModel, ApplicationUser>()
                .ForMember(d => d.Roles, map => map.Ignore());

            CreateMap<ApplicationUser, UserDataSource>()
                .ForMember(s => s.UserId, map => map.MapFrom(m => m.Id))
                .ForMember(s => s.FullName, map => map.MapFrom(m => m.FullName));

            CreateMap<ApplicationUser, UserPatchViewModel>()
                .ReverseMap();

            CreateMap<ApplicationRole, RoleViewModel>()
                .ForMember(d => d.Permissions, map => map.MapFrom(s => s.Claims))
                .ForMember(d => d.UsersCount, map => map.MapFrom(s => s.Users != null ? s.Users.Count : 0))
                .ReverseMap();

            CreateMap<RoleViewModel, ApplicationRole>();

            CreateMap<IdentityRoleClaim<string>, ClaimViewModel>()
                .ForMember(d => d.Type, map => map.MapFrom(s => s.ClaimType))
                .ForMember(d => d.Value, map => map.MapFrom(s => s.ClaimValue))
                .ReverseMap();

            CreateMap<ApplicationPermission, PermissionViewModel>()
                .ReverseMap();

            CreateMap<IdentityRoleClaim<string>, PermissionViewModel>()
                .ConvertUsing(s => (PermissionViewModel)ApplicationPermissions.GetPermissionByValue(s.ClaimValue));

            CreateMap<NewsCategory, NewsCategoryModel>()
                .ForMember(d => d.CreatedBy, map => map.MapFrom<CreatedByValueResolver<NewsCategory, NewsCategoryModel>>())
                .ForMember(d => d.UpdatedBy, map => map.MapFrom<UpdatedByValueResolver<NewsCategory, NewsCategoryModel>>())
                .ForMember(d => d.ParentCategoryName, map => map.MapFrom<ParentCategoryValueResolver>())
                .ReverseMap();

            CreateMap<NewsTag, NewsTagModel>()
                .ForMember(d => d.CreatedBy, map => map.MapFrom<CreatedByValueResolver<NewsTag, NewsTagModel>>())
                .ForMember(d => d.UpdatedBy, map => map.MapFrom<UpdatedByValueResolver<NewsTag, NewsTagModel>>())
                .ReverseMap();
        }
    }
}
