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

        buttonsBlock += json.accountData.isAdmin || json.accountRights.update_articles || (json.accountRights.update_own_articles && json.newsData.authorUuid === json.accountData.uuid)
        ? `<button onclick="updateArticle()" class="mainNewsBlockArticleActionsUpdate">${json.commonStrings.root.news.homePage.updateArticleButton}</button>`
        : `<button class="mainNewsBlockArticleActionsDisabled">${json.commonStrings.root.news.homePage.updateArticleButton}</button>`;

        buttonsBlock += json.accountData.isAdmin || json.accountRights.remove_articles || (json.accountRights.remove_own_articles && json.newsData.authorUuid === json.accountData.uuid)
        ? `<button onclick="removeArticle()" class="mainNewsBlockArticleActionsRemove">${json.commonStrings.root.news.homePage.removeArticleButton}</button>`
        : `<button class="mainNewsBlockArticleActionsDisabled">${json.commonStrings.root.news.homePage.removeArticleButton}</button>`;

        buttonsBlock += '</div>';

        document.getElementById('mainNewsBlockArticle').innerHTML += buttonsBlock;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleDate">${json.newsData.timestamp}</div>`;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleTitle">${json.newsData.title}</div>`;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleContent">${json.newsData.content}</div>`;
        document.getElementById('mainNewsBlockArticle').innerHTML += `<div class="mainNewsBlockArticleAuthor">${json.newsData.author}</div>`;

        var commentsSection   = document.createElement('div');
        var postSection       = document.createElement('div');
        var commentsContainer = document.createElement('div');

        commentsSection     .setAttribute('id', 'mainNewsBlockComments');
        commentsContainer   .setAttribute('id', 'commentsList');
        commentsSection     .setAttribute('class', 'mainNewsBlockComments');
        postSection         .setAttribute('class', 'mainNewsBlockCommentsPostSection');
        commentsContainer   .setAttribute('class', 'mainNewsBlockCommentsContainer');

        postSection.innerHTML += `<button onclick="addCommentOnArticle(null)" class="mainNewsBlockCommentsPostButton">${json.commonStrings.root.news.commentsSection.postCommentButton}</button>`;

        commentsContainer.innerHTML += json.newsData.comments.length === 0
        ? `<div id="mainNewsBlockCommentsEmptyStack" class="mainNewsBlockCommentsEmptyStack">${json.commonStrings.root.news.commentsSection.emptyCommentsStack}</div>`
        : `<div id="mainNewsBlockCommentsEmptyStack" class="mainNewsBlockCommentsEmptyStack" style="display:none">${json.commonStrings.root.news.commentsSection.emptyCommentsStack}</div>`;

        buildCommentsSection(json.newsData.comments, json.accountData, json.accountRights, json.commonStrings, (result) =>
        {
          if(result != null) commentsContainer.innerHTML += result;

          commentsSection     .appendChild(postSection);
          commentsSection     .appendChild(commentsContainer);

          document.getElementById('mainNewsBlockArticle').appendChild(commentsSection);
        });
      });
    });
  }
}

/****************************************************************************************************/

function buildCommentsSection(currentComments, accountData, accountRights, commonStrings, callback)
{
  var resultArray = [], index = 0;

  var browse = () =>
  {
    resultArray.push(`<div name="${currentComments[index].commentUuid}" class="mainNewsBlockCommentsElement">`);
    resultArray.push(`<div class="mainNewsBlockCommentsElementHeader">${currentComments[index].commentDate} - ${currentComments[index].commentAuthor}</div>`);
    resultArray.push(`<div class="mainNewsBlockCommentsElementContent">`);
    resultArray.push(`<div class="mainNewsBlockCommentsElementMessage">${currentComments[index].commentContent}</div>`);

    buildCommentsSection(currentComments[index].commentChildren, accountData, accountRights, commonStrings, (result) =>
    {
      if(result != null) resultArray.push(result);

      resultArray.push(`</div>`);
      resultArray.push(`<div class="mainNewsBlockCommentsElementActions">`);

      currentComments[index].commentRemoved
      ? resultArray.push(`<div class="mainNewsBlockCommentsElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.answerComment}</div>`)
      : resultArray.push(`<div onclick="addCommentOnArticle('${currentComments[index].commentUuid}')" class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.answerComment}</div>`);

      (accountData.isAdmin || accountRights.update_article_comments || (accountRights.update_article_own_comments && currentComments[index].commentAuthorUuid === accountData.uuid)) && currentComments[index].commentRemoved == false
      ? resultArray.push(`<div onclick="updateCommentOnArticle('${currentComments[index].commentUuid}')" class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.updateComment}</div>`)
      : resultArray.push(`<div class="mainNewsBlockCommentsElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.updateComment}</div>`);

      (accountData.isAdmin || accountRights.remove_article_comments || (accountRights.remove_article_own_comments && currentComments[index].commentAuthorUuid === accountData.uuid)) && currentComments[index].commentRemoved == false
      ? resultArray.push(`<div onclick="removeCommentOnArticle('${currentComments[index].commentUuid}')" class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.removeComment}</div>`)
      : resultArray.push(`<div class="mainNewsBlockCommentsElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.removeComment}</div>`);

      resultArray.push(`</div></div>`);

      if(currentComments[index += 1] == undefined) return callback(resultArray.join(''));

      browse();
    });
  }

  currentComments.length === 0
  ? callback(null)
  : browse();
}

/****************************************************************************************************/