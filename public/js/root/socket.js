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

      var article = document.getElementById('mainNewsBlockArticle');

      article.setAttribute('name', newsData.uuid);

      var buttonsBlock = '<div class="mainNewsBlockArticleActions">';

      buttonsBlock += result.accountData.isAdmin || result.accountRights.update_articles || (result.accountRights.update_own_articles && result.newsData.author === result.accountData.uuid)
      ? `<button onclick="updateArticle()" class="mainNewsBlockArticleActionsUpdate">${result.commonStrings.root.news.updateArticleButton}</button>`
      : `<button class="mainNewsBlockArticleActionsDisabled">${result.commonStrings.root.news.updateArticleButton}</button>`;

      buttonsBlock += result.accountData.isAdmin || result.accountRights.remove_articles || (result.accountRights.remove_own_articles && result.newsData.author === result.accountData.uuid)
      ? `<button onclick="removeArticle()" class="mainNewsBlockArticleActionsRemove">${result.commonStrings.root.news.removeArticleButton}</button>`
      : `<button class="mainNewsBlockArticleActionsDisabled">${result.commonStrings.root.news.removeArticleButton}</button>`;

      buttonsBlock += '</div>';

      article.innerHTML = buttonsBlock;
      article.innerHTML += `<div class="mainNewsBlockArticleDate">${newsData.timestamp}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleTitle">${newsData.title}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleContent">${newsData.content}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleAuthor">${newsData.author}</div>`;

      document.getElementById('asideNewsBlockList').children[0].setAttribute('class', 'asideNewsBlockListElementSelected');
    });
  }

  displayInfo('Un nouvel article a été ajouté', null);
});

/****************************************************************************************************/
// WHEN AN ARTICLE IS UPDATED
/****************************************************************************************************/

socket.on('articleUpdated', (articleData, commonStrings) =>
{
  if(document.getElementById('mainNewsBlockArticle'))
  {
    if(document.getElementById('mainNewsBlockArticle').getAttribute('name') === articleData.articleUuid)
    {
      document.getElementById('mainNewsBlockArticle').children[2].innerText = articleData.articleTitle;
      document.getElementById('mainNewsBlockArticle').children[3].innerHTML = articleData.articleContent;
    }
  }

  if(document.getElementById('asideNewsBlockList'))
  {
    const currentArticles = document.getElementById('asideNewsBlockList').children;

    for(var x = 0; x < currentArticles.length; x++)
    {
      if(currentArticles[x].getAttribute('name') === articleData.articleUuid) currentArticles[x].children[1].innerText = articleData.articleTitle;
    }
  }

  if(document.getElementById('asideNewsDeployBlockList'))
  {
    const currentArticles = document.getElementById('asideNewsDeployBlockList').children;

    for(var x = 0; x < currentArticles.length; x++)
    {
      if(currentArticles[x].getAttribute('name') === articleData.articleUuid) currentArticles[x].children[1].innerText = articleData.articleTitle;
    }
  }

  displayInfo(commonStrings.root.news.socket.updatedArticleMessage, null, 'updatedArticleSocket');
});

/****************************************************************************************************/
// WHEN AN ARTICLE IS REMOVED
/****************************************************************************************************/

socket.on('removedArticle', (articleUuid, commonStrings) =>
{
  if(document.getElementById('asideNewsBlockList'))
  {
    const currentArticles = document.getElementById('asideNewsBlockList').children;

    for(var x = 0; x < currentArticles.length; x++)
    {
      if(currentArticles[x].getAttribute('name') === articleUuid) currentArticles[x].remove();
    }
  }

  if(document.getElementById('asideNewsDeployBlockList'))
  {
    const currentArticles = document.getElementById('asideNewsDeployBlockList').children;

    for(var x = 0; x < currentArticles.length; x++)
    {
      if(currentArticles[x].getAttribute('name') === articleUuid) currentArticles[x].remove();
    }
  }

  if(document.getElementById('mainNewsBlockArticle'))
  {
    if(document.getElementById('mainNewsBlockArticle').getAttribute('name') === articleUuid)
    {
      document.getElementById('mainNewsBlockArticle').removeAttribute('name');
      document.getElementById('mainNewsBlockArticle').innerHTML = '';

      document.getElementById('asideNewsBlockList').children.length > 1
      ? newsSelected(document.getElementById('asideNewsBlockList').children[0].getAttribute('name'))
      : document.getElementById('mainNewsBlockArticle').innerHTML = `<div class="mainNewsBlockEmpty" id="mainNewsBlockEmpty"><div class="mainNewsBlockEmptyIcon"><i class="far fa-paper-plane"></i></div><div class="mainNewsBlockEmptyMessage">${commonStrings.root.news.emptyArticles}</div></div>`;
    }
  }

  if(document.getElementById('asideNewsBlockList').children.length === 1) document.getElementById('asideNewsBlockList').innerHTML = `<div id="asideNewsBlockListEmpty" class="asideNewsBlockListEmpty">${commonStrings.root.news.emptyArticles}</div>`;
  if(document.getElementById('asideNewsDeployBlockList').children.length === 1) document.getElementById('asideNewsDeployBlockList').innerHTML = `<div id="asideNewsDeployBlockListEmpty" class="asideNewsBlockListEmpty">${commonStrings.root.news.emptyArticles}</div>`;

  displayInfo(commonStrings.root.news.socket.removedArticleMessage, null, 'removedArticleSocket');
});

/****************************************************************************************************/
/****************************************************************************************************/