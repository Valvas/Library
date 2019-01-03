/****************************************************************************************************/
/****************************************************************************************************/

var getNextNewsRequest = null;
var getNextNewsLoader = null;

if(document.getElementById('asideNewsBlockList'))
{
  const articles = document.getElementById('asideNewsBlockList').children;

  for(var x = 0; x < articles.length; x++)
  {
    if(articles[x].getAttribute('class') === 'asideNewsBlockListElementSelected')
    {
      document.getElementById('asideNewsBlockList').scrollTop = (articles[x].offsetTop - 10);
    }
  }

  if(document.getElementById('asideNewsBlockListLoad')) document.getElementById('asideNewsBlockListLoad').addEventListener('click', loadMoreNews);
}

if(document.getElementById('asideNewsDeployBlockList'))
{
  const articles = document.getElementById('asideNewsDeployBlockList').children;

  for(var x = 0; x < articles.length; x++)
  {
    if(articles[x].getAttribute('class') === 'asideNewsDeployBlockListArticleSelected')
    {
      document.getElementById('asideNewsDeployBlockList').scrollTop = (articles[x].offsetTop - 10);
    }
  }

  if(document.getElementById('asideNewsDeployBlockListLoad')) document.getElementById('asideNewsDeployBlockListLoad').addEventListener('click', loadMoreNews);
}

/****************************************************************************************************/
/****************************************************************************************************/

function loadMoreNews(event)
{
  if(getNextNewsRequest != null)
  {
    getNextNewsRequest.abort();
    getNextNewsRequest = null;
  }

  document.getElementById('asideNewsBlockListLoad').style.display = 'none';
  document.getElementById('asideNewsDeployBlockListLoad').style.display = 'none';

  var startTheRequest = () =>
  {
    displayLoader(`Chargement des articles supplémentaires en cours`, (loader) =>
    {
      getNextNewsLoader = loader;

      getNextNewsRequest = $.ajax(
      {
        method: 'PUT', dataType: 'json', timeout: 5000, url: '/queries/root/news/get-news-data-after-index', data: {  newsUuid: document.getElementById('asideNewsBlockList').children[document.getElementById('asideNewsBlockList').children.length - 2].getAttribute('name') },
    
        error: (xhr, textStatus, errorThrown) =>
        {
          document.getElementById('asideNewsBlockListLoad').removeAttribute('style');
          document.getElementById('asideNewsDeployBlockListLoad').removeAttribute('style');

          removeLoader(loader, () =>
          {
            getNextNewsRequest = null;
            getNextNewsLoader = null;

            if(textStatus !== 'abort')
            {
              xhr.responseJSON != undefined
              ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
              : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
            }
          });
        }
    
      }).done((json) =>
      {
        removeLoader(loader, () => 
        {
          getNextNewsRequest = null;
          getNextNewsLoader = null;

          const existingArticles = document.getElementById('asideNewsBlockList').children;
          var existingArticlesUuids = [];

          for(var x = 0; x < existingArticles.length; x++)
          {
            if(existingArticles[x].hasAttribute('name')) existingArticlesUuids.push(existingArticles[x].getAttribute('name'));
          }

          document.getElementById('asideNewsBlockListLoad').removeAttribute('style');
          document.getElementById('asideNewsDeployBlockListLoad').removeAttribute('style');
          
          if(existingArticlesUuids.length >= json.newsData.length) return displayInfo('Tous les articles ont déjà été chargés', null, '0001');

          for(var x = 0; x < json.newsData.length; x++)
          {
            if(existingArticlesUuids.includes(json.newsData[x].uuid) == false)
            {
              var asideNewsBlock = document.createElement('div');
              var deployNewsBlock = document.createElement('div');

              asideNewsBlock.setAttribute('name', json.newsData[x].uuid);
              deployNewsBlock.setAttribute('name', json.newsData[x].uuid);

              asideNewsBlock.setAttribute('class', 'asideNewsBlockListElement');
              deployNewsBlock.setAttribute('class', 'asideNewsDeployBlockListArticle');

              asideNewsBlock.innerHTML = `<div class="asideNewsBlockListElementDate">${json.newsData[x].timestamp}</div><div class="asideNewsBlockListElementTitle">${json.newsData[x].title}</div>`;
              deployNewsBlock.innerHTML = `<div class="asideNewsDeployBlockListArticleDate">${json.newsData[x].timestamp}</div><div class="asideNewsDeployBlockListArticleTitle">${json.newsData[x].title}</div>`;

              document.getElementById('asideNewsBlockList').insertBefore(asideNewsBlock, document.getElementById('asideNewsBlockList').children[x]);
              document.getElementById('asideNewsDeployBlockList').insertBefore(deployNewsBlock, document.getElementById('asideNewsDeployBlockList').children[x]);
            }
          }

          applyNewsSelectionListeners();
        });
      });
    });
  }

  if(document.getElementById('asideNewsBlockList'))
  {
    if(getNextNewsRequest == null) startTheRequest();

    else
    {
      removeLoader(getNextNewsLoader, () =>
      {
        getNextNewsLoader = null;

        startTheRequest();
      });
    }
  }
}

/****************************************************************************************************/
/****************************************************************************************************/