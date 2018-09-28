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
    displayLoader('Chargement', `Le chargement de l'article est en cours`, null, (loader) =>
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
          const currentArticleUuid = articles[x].getAttribute('name');

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
        document.getElementById('mainNewsBlockArticle').children[0].innerText = json.newsData.timestamp;
        document.getElementById('mainNewsBlockArticle').children[1].innerText = json.newsData.title;
        document.getElementById('mainNewsBlockArticle').children[2].innerHTML = json.newsData.content;
        document.getElementById('mainNewsBlockArticle').children[3].innerText = json.newsData.author;
      });
    });
  }
}

/****************************************************************************************************/