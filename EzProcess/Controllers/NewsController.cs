using AutoMapper;
using EzProcess.Caching;
using EzProcess.Core;
using EzProcess.Core.Identity.Interfaces;
using EzProcess.Core.Models;
using EzProcess.Utils;
using EzProcess.ViewModels;
using EzProcess.ViewModels.News;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EzProcess.Controllers
{
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : BaseController
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthorizationService _authorizationService;
        private readonly IAccountManager _accountManager;

        public NewsController(IMapper mapper, IUnitOfWork unitOfWork, IAuthorizationService authorizationService, IAccountManager accountManager)
            : base(accountManager)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _authorizationService = authorizationService;
            _accountManager = accountManager;
        }

        #region categories

        [HttpGet("categories/{includeDeleted:bool?}")]
        public async Task<IActionResult> GetCategories(bool includeDeleted = false)
        {
            IEnumerable<NewsCategory> dbCategories = await _unitOfWork.Cache.GetNewsCategoriesAsync(includeDeleted);
            List<NewsCategoryModel> categoryModels = _mapper.Map<List<NewsCategoryModel>>(dbCategories);
            return Ok(categoryModels);
        }

        [HttpPut("categories")]
        [Authorize(Authorization.Policies.NewsSettingsPolicy)]
        public async Task<IActionResult> CreateCategory([FromBody] NewsCategoryModel model)
        {
            if (ModelState.IsValid)
            {
                if (model == null)
                    return BadRequest($"{nameof(model)} {Resource.Instance.GetString(Constants.CANNOT_BE_NULL)}");

                model.Id = Guid.NewGuid();

                NewsCategory entity = _mapper.Map<NewsCategory>(model);

                var result = await _unitOfWork.News.CreateCategoryAsync(entity);
                if (result.Succeeded)
                {
                    model = _mapper.Map<NewsCategoryModel>((NewsCategory)result.Result);
                    return Ok(model);
                }
                return StatusCode(StatusCodes.Status500InternalServerError, Resource.Instance.GetString(Constants.ERR_WHEN_CREATE) + result.Result);
            }
            return BadRequest(ModelState);
        }

        [HttpPatch("categories")]
        [Authorize(Authorization.Policies.NewsSettingsPolicy)]
        public async Task<IActionResult> UpdateCategory([FromBody] NewsCategoryModel model)
        {
            if (ModelState.IsValid)
            {
                NewsCategory entity = _mapper.Map<NewsCategory>(model);
                var result = await _unitOfWork.News.UpdateCategoryAsync(entity);
                if (result.Succeeded)
                {
                    model = _mapper.Map<NewsCategoryModel>((NewsCategory)result.Result);
                    return Ok(model);
                }
                return StatusCode(StatusCodes.Status500InternalServerError, Resource.Instance.GetString(Constants.ERR_WHEN_UPDATE) + result.Result);
            }
            return BadRequest(ModelState);
        }

        [HttpDelete("categories/{objectId}")]
        [Authorize(Authorization.Policies.NewsSettingsPolicy)]
        public async Task<IActionResult> DeleteCategory(string objectId)
        {
            var result = await _unitOfWork.News.DeleteCategoryAsync(objectId);
            if (result.Succeeded)
            {
                return Ok();
            }
            return StatusCode(StatusCodes.Status500InternalServerError, Resource.Instance.GetString(Constants.ERR_WHEN_DELETE) + result.Result);

        }

        #endregion

        #region tags

        [HttpGet("tags")]
        public async Task<IActionResult> GetTags()
        {
            IEnumerable<NewsTag> dbTags = await _unitOfWork.Cache.GetNewsTagsAsync();
            List<NewsTagModel> tagModels = _mapper.Map<List<NewsTagModel>>(dbTags);
            return Ok(tagModels);
        }

        [HttpPut("tags")]
        [Authorize(Authorization.Policies.NewsSettingsPolicy)]
        public async Task<IActionResult> CreateTag([FromBody] NewsTagModel model)
        {
            if (ModelState.IsValid)
            {
                if (model == null)
                    return BadRequest($"{nameof(model)} {Resource.Instance.GetString(Constants.CANNOT_BE_NULL)}");

                model.Id = Guid.NewGuid();

                NewsTag entity = _mapper.Map<NewsTag>(model);

                var result = await _unitOfWork.News.CreateTagAsync(entity);
                if (result.Succeeded)
                {
                    model = _mapper.Map<NewsTagModel>((NewsTag)result.Result);
                    return Ok(model);
                }
                return StatusCode(StatusCodes.Status500InternalServerError, Resource.Instance.GetString(Constants.ERR_WHEN_CREATE) + result.Result);
            }
            return BadRequest(ModelState);
        }

        [HttpPatch("tags")]
        [Authorize(Authorization.Policies.NewsSettingsPolicy)]
        public async Task<IActionResult> UpdateTag([FromBody] NewsTagModel model)
        {
            if (ModelState.IsValid)
            {
                NewsTag entity = _mapper.Map<NewsTag>(model);
                var result = await _unitOfWork.News.UpdateTagAsync(entity);
                if (result.Succeeded)
                {
                    model = _mapper.Map<NewsTagModel>((NewsTag)result.Result);
                    return Ok(model);
                }
                return StatusCode(StatusCodes.Status500InternalServerError, Resource.Instance.GetString(Constants.ERR_WHEN_UPDATE) + result.Result);
            }
            return BadRequest(ModelState);
        }

        [HttpDelete("tags/{objectId}")]
        [Authorize(Authorization.Policies.NewsSettingsPolicy)]
        public async Task<IActionResult> DeleteTag(string objectId)
        {
            var result = await _unitOfWork.News.DeleteTagAsync(objectId);
            if (result.Succeeded)
            {
                return Ok();
            }
            return StatusCode(StatusCodes.Status500InternalServerError, Resource.Instance.GetString(Constants.ERR_WHEN_DELETE) + result.Result);
        }

        #endregion

        #region articles

        [HttpGet("article/{pageNumber:int}/{pageSize:int}")]
        [ProducesResponseType(200, Type = typeof(List<NewsArticleModel>))]
        public async Task<IActionResult> GetArticles(int pageNumber, int pageSize)
        {
            

            return Ok(new List<NewsArticleModel>());
        }

        #endregion
    }
}
