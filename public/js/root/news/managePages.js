/****************************************************************************************************/
/****************************************************************************************************/

var currentRequest = null;
var updatePagesRequest = null;

/****************************************************************************************************/
/****************************************************************************************************/

if(document.getElementById('asideNewsBlockPages'))
{
  const asideNewsPages = document.getElementById('asideNewsBlockPages').children;

  for(var x = 0; x < asideNewsPages.length; x++)
  {
    if(asideNewsPages[x].getAttribute('class') === 'asideNewsBlockPagesElementEnabled') asideNewsPages[x].addEventListener('click', changeNewsAsidePage);
  }
}

if(document.getElementById('asideNewsDeployBlockPages'))
{
  const deployNewsPages = document.getElementById('asideNewsDeployBlockPages').children;

  for(var x = 0; x < deployNewsPages.length; x++)
  {
    if(deployNewsPages[x].getAttribute('class') === 'asideNewsDeployBlockPagesEnabled') deployNewsPages[x].addEventListener('click', changeNewsAsidePage);
  }
}

/****************************************************************************************************/
/****************************************************************************************************/

function updatePages(pageInfos)
{
  if(document.getElementById('asideNewsBlockPages'))
  {
    document.getElementById('asideNewsBlockPages').innerHTML = '';

    for(var x = pageInfos.startIndex; x < (pageInfos.startIndex + 8); x++)
    {
      var pageSelector = document.createElement('div');

      if(x === pageInfos.currentIndex) pageSelector.setAttribute('class', 'asideNewsBlockPagesElementSelected');

      else if(x >= pageInfos.endIndex) pageSelector.setAttribute('class', 'asideNewsBlockPagesElementDisabled');

      else
      {
        pageSelector.setAttribute('tag', x);
        pageSelector.setAttribute('class', 'asideNewsBlockPagesElementEnabled');
        pageSelector.addEventListener('click', changeNewsAsidePage);
      }

      pageSelector.innerText = (x + 1);

      document.getElementById('asideNewsBlockPages').appendChild(pageSelector);
    }
  }

  if(document.getElementById('asideNewsDeployBlockPages'))
  {
    document.getElementById('asideNewsDeployBlockPages').innerHTML = '';

    for(var x = pageInfos.startIndex; x < (pageInfos.startIndex + 8); x++)
    {
      var pageSelector = document.createElement('div');

      if(x === pageInfos.currentIndex) pageSelector.setAttribute('class', 'asideNewsDeployBlockPagesSelected');

      else if(x >= pageInfos.endIndex) pageSelector.setAttribute('class', 'asideNewsDeployBlockPagesDisabled');

      else
      {
        pageSelector.setAttribute('tag', x);
        pageSelector.setAttribute('class', 'asideNewsDeployBlockPagesEnabled');
        pageSelector.addEventListener('click', changeNewsAsidePage);
      }

      pageSelector.innerText = (x + 1);

      document.getElementById('asideNewsDeployBlockPages').appendChild(pageSelector);
    }
  }

  if(document.getElementById('mainNewsBlockArticle'))
  {
    if(updatePagesRequest != null)
    {
      updatePagesRequest.abort();
      updatePagesRequest = null;
    }

    request = $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 5000, url: '/queries/root/news/get-news-data', data: { newsUuid: document.getElementById('asideNewsBlockList').children[pageInfos.currentIndex * 5].getAttribute('name') },
    
      error: (xhr, textStatus, errorThrown) =>
      {
        updatePagesRequest = null;

        if(textStatus !== 'abort')
        {
          xhr.responseJSON != undefined
          ? displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail)
          : displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
        }
      }

    }).done((json) =>
    {
      updatePagesRequest = null;

      document.getElementById('mainNewsBlockArticle').setAttribute('name', json.newsData.uuid);

      document.getElementById('mainNewsBlockArticle').children[0].innerText = json.newsData.timestamp;
      document.getElementById('mainNewsBlockArticle').children[1].innerText = json.newsData.title;
      document.getElementById('mainNewsBlockArticle').children[2].innerHTML = json.newsData.content;
      document.getElementById('mainNewsBlockArticle').children[3].innerText = json.newsData.author;
    });
  }
}

/****************************************************************************************************/
/****************************************************************************************************/

function changeNewsAsidePage(event)
{
  const selectedPage = parseInt(event.target.getAttribute('tag'));

  if(currentRequest != null)
  {
    currentRequest.abort();

    currentRequest = null;
  }

  displayLoader('Chargement', `Chargement de la page ${selectedPage + 1} en cours`, null, (loader) =>
  {
    currentRequest = $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 5000, url: '/queries/root/news/get-news-data-from-index', data: { currentPage: selectedPage },
  
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
      removeLoader(loader, () =>
      {
        updatePages(json.pageInfos);

        document.getElementById('asideNewsBlockList').innerHTML = '';

        for(var x = 0; x < json.newsData.length; x++)
        {
          for(var y = 0; y < json.newsData[x].length; y++)
          {
            var asideNewsBlock = document.createElement('div');

            asideNewsBlock.setAttribute('name', json.newsData[x][y].uuid);

            if(x === (json.pageInfos.currentIndex - json.pageInfos.startIndex))
            {
              (y === 0 && document.getElementById('mainNewsBlockArticle'))
              ? asideNewsBlock.setAttribute('class', 'asideNewsBlockListElementSelected')
              : asideNewsBlock.setAttribute('class', 'asideNewsBlockListElement');
            }

            else
            {
              asideNewsBlock.setAttribute('class', 'asideNewsBlockListElementHidden');
            }

            asideNewsBlock.innerHTML = `<div class="asideNewsBlockListElementDate">${json.newsData[x][y].timestamp}</div><div class="asideNewsBlockListElementTitle">${json.newsData[x][y].title}</div>`;

            document.getElementById('asideNewsBlockList').appendChild(asideNewsBlock);
          }
        }
      });
    });
  });
}

/****************************************************************************************************/
/****************************************************************************************************/