/****************************************************************************************************/

var currentRequest = null;

applyNewsSelectionListeners();

/****************************************************************************************************/

function applyNewsSelectionListeners()
{
  if(document.getElementById('asideNewsBlockList'))
  {
    var asideListNews = document.getElementById('asideNewsBlockList').children;

    for(var x = 0; x < asideListNews.length; x++)
    {
      if(asideListNews[x].hasAttribute('name'))
      {
        const currentNewsUuid = asideListNews[x].getAttribute('name');

        asideListNews[x].addEventListener('click', () => { newsSelected(currentNewsUuid) });
      }
    }
  }

  if(document.getElementById('asideNewsDeployBlockList'))
  {
    var asideListNews = document.getElementById('asideNewsDeployBlockList').children;

    for(var x = 0; x < asideListNews.length; x++)
    {
      if(asideListNews[x].hasAttribute('name'))
      {
        const currentNewsUuid = asideListNews[x].getAttribute('name');

        asideListNews[x].addEventListener('click', () => { newsSelected(currentNewsUuid) });
      }
    }
  }
}

/****************************************************************************************************/

function newsSelected(newsUuid)
{
  if(currentRequest != null)
  {
    currentRequest.abort();
  }

  if(document.getElementById('mainNewsBlockArticle') && document.getElementById('mainNewsBlockArticle').getAttribute('name') !== newsUuid)
  {
    displayLoader(`Le chargement de l'article est en cours`, (loader) =>
    {
      currentRequest = $.ajax(
      {
        method: 'PUT', dataType: 'json', timeout: 5000, url: '/queries/root/news/get-news-data', data: { newsUuid: newsUuid },
    
        error: (xhr, textStatus, errorThrown) =>
        {
          currentRequest = null;

          removeLoader(loader, () =>
          {
            if(textStatus !== 'abort')
            {
              xhr.responseJSON != undefined
              ? displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail)
              : displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
            }
          });
        }
    
      }).done((json) =>
      {
        currentRequest = null;
        
        removeLoader(loader, () => {});

        var articles = document.getElementById('asideNewsBlockList').children;

        for(var x = 0; x < articles.length; x++)
        {
          if(articles[x].getAttribute('class') === 'asideNewsBlockListElement' && articles[x].getAttribute('name') === json.newsData.uuid)
          {
            articles[x].setAttribute('class', 'asideNewsBlockListElementSelected');
          }

          else if(articles[x].getAttribute('class') === 'asideNewsBlockListElementSelected')
          {
            articles[x].setAttribute('class', 'asideNewsBlockListElement');
          }
        }

        closeAsideNews();

        document.getElementById('mainNewsBlockArticle').scrollIntoView({ behavior: 'smooth' });

        document.getElementById('mainNewsBlockArticle').setAttribute('name', json.newsData.uuid);

        document.getElementById('mainNewsBlockArticle').innerHTML = '';

        var buttonsBlock = '<div class="mainNewsBlockArticleActions">';

        buttonsBlock += json.accountData.isAdmin || json.accountRights.update_articles || (json.accountRights.update_own_articles && json.newsData.author === json.accountData.uuid)
        ? `<button onclick="updateArticle()" class="mainNewsBlockArticleActionsUpdate">${json.commonStrings.root.news.updateArticleButton}</button>`
        : `<button class="mainNewsBlockArticleActionsDisabled">${json.commonStrings.root.news.updateArticleButton}</button>`;

        buttonsBlock += json.accountData.isAdmin || json.accountRights.remove_articles || (json.accountRights.remove_own_articles && json.newsData.author === json.accountData.uuid)
        ? `<button onclick="removeArticle()" class="mainNewsBlockArticleActionsRemove">${json.commonStrings.root.news.removeArticleButton}</button>`
        : `<button class="mainNewsBlockArticleActionsDisabled">${json.commonStrings.root.news.removeArticleButton}</button>`;

        buttonsBlock += '</div>';

        document.getElementById('mainNewsBlockArticle').innerHTML += buttonsBlock;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleDate">${json.newsData.timestamp}</div>`;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleTitle">${json.newsData.title}</div>`;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleContent">${json.newsData.content}</div>`;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleAuthor">${json.newsData.author}</div>`;
      });
    });
  }
}

/****************************************************************************************************/