/****************************************************************************************************/
/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/
/****************************************************************************************************/

socket.on('connect', () => { socket.emit('rootNewsJoin') });

/****************************************************************************************************/
// WHEN A NEWS HAS BEEN CREATED
/****************************************************************************************************/

socket.on('newsCreated', (newsData) =>
{
  if(document.getElementById('asideNewsBlockList'))
  {
    if(document.getElementById('asideNewsBlockListEmpty')) document.getElementById('asideNewsBlockListEmpty').remove();

    if(document.getElementById('asideNewsBlockList').children.length === 0)
    {
      var loadMoreNewsButton = document.createElement('div');
      loadMoreNewsButton.setAttribute('id', 'asideNewsBlockListLoad');
      loadMoreNewsButton.setAttribute('class', 'asideNewsBlockListLoad');
      loadMoreNewsButton.innerText = `Charger plus d'articles`;
      loadMoreNewsButton.addEventListener('click', loadMoreNews);

      document.getElementById('asideNewsBlockList').appendChild(loadMoreNewsButton);
    }

    var asideNewsBlock         = document.createElement('div');

    asideNewsBlock             .setAttribute('name', newsData.uuid);
    asideNewsBlock             .setAttribute('class', 'asideNewsBlockListElement');

    asideNewsBlock             .innerHTML = `<div class="asideNewsBlockListElementDate">${newsData.timestamp}</div><div class="asideNewsBlockListElementTitle">${newsData.title}</div>`;

    asideNewsBlock             .addEventListener('click', () => { newsSelected(newsData.uuid) });

    document.getElementById('asideNewsBlockList').insertBefore(asideNewsBlock, document.getElementById('asideNewsBlockList').children[0]);
  }

  if(document.getElementById('asideNewsDeployBlockList'))
  {
    if(document.getElementById('asideNewsDeployBlockListEmpty')) document.getElementById('asideNewsDeployBlockListEmpty').remove();

    if(document.getElementById('asideNewsDeployBlockList').children.length === 0)
    {
      var loadMoreNewsButton = document.createElement('div');
      loadMoreNewsButton.setAttribute('id', 'asideNewsDeployBlockListLoad');
      loadMoreNewsButton.setAttribute('class', 'asideNewsDeployBlockListLoad');
      loadMoreNewsButton.innerText = `Charger plus d'articles`;
      loadMoreNewsButton.addEventListener('click', loadMoreNews);

      document.getElementById('asideNewsDeployBlockList').appendChild(loadMoreNewsButton);
    }

    var deployNewsBlock        = document.createElement('div');

    deployNewsBlock            .setAttribute('name', newsData.uuid);
    deployNewsBlock            .setAttribute('class', 'asideNewsDeployBlockListArticle');

    deployNewsBlock            .innerHTML = `<div class="asideNewsDeployBlockListArticleDate">${newsData.timestamp}</div><div class="asideNewsDeployBlockListArticleTitle">${newsData.title}</div>`;

    deployNewsBlock            .addEventListener('click', () => { newsSelected(newsData.uuid) });

    document.getElementById('asideNewsDeployBlockList').insertBefore(deployNewsBlock, document.getElementById('asideNewsDeployBlockList').children[0]);
  }

  if(document.getElementById('mainNewsBlockEmpty'))
  {
    $.ajax(
    {
      method: 'GET', dataType: 'json', timeout: 5000, url: '/queries/root/news/get-rights-on-articles',
  
      error: (xhr, textStatus, errorThrown) => { return }
  
    }).done((result) =>
    {
      const container = document.getElementById('mainNewsBlockEmpty').parentNode;

      document.getElementById('mainNewsBlockEmpty').remove();

      var article = document.createElement('div');

      article.setAttribute('name', newsData.uuid);
      article.setAttribute('id', 'mainNewsBlockArticle');
      article.setAttribute('class', 'mainNewsBlockArticle');

      article.innerHTML += `<div class="mainNewsBlockArticleDate">${newsData.timestamp}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleTitle">${newsData.title}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleContent">${newsData.content}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleAuthor">${newsData.author}</div>`;

      container.appendChild(article);

      document.getElementById('asideNewsBlockList').children[0].setAttribute('class', 'asideNewsBlockListElementSelected');
    });
  }

  displayInfo('Un nouvel article a été ajouté', null);
});

/****************************************************************************************************/
/****************************************************************************************************/