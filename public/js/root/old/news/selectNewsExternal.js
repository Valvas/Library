/****************************************************************************************************/

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
  if(document.getElementById('asideNewsBlockList'))
  {
    location = '/news/' + newsUuid;
  }
}

/****************************************************************************************************/