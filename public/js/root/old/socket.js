/****************************************************************************************************/
/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/
/****************************************************************************************************/

socket.on('connect', () => { socket.emit('rootNewsJoin') });

/****************************************************************************************************/
// WHEN A NEWS HAS BEEN CREATED
/****************************************************************************************************/

socket.on('newsCreated', (newsData, commonStrings) =>
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
      document.getElementById('mainNewsBlockEmpty').remove();

      var article = document.getElementById('mainNewsBlockArticle');

      article.setAttribute('name', newsData.uuid);

      var buttonsBlock = '<div class="mainNewsBlockArticleActions">';

      buttonsBlock += result.accountData.isAdmin || result.accountRights.update_articles || (result.accountRights.update_own_articles && newsData.authorUuid === result.accountData.uuid)
      ? `<button onclick="updateArticle()" class="mainNewsBlockArticleActionsUpdate">${result.commonStrings.root.news.homePage.updateArticleButton}</button>`
      : `<button class="mainNewsBlockArticleActionsDisabled">${result.commonStrings.root.news.homePage.updateArticleButton}</button>`;

      buttonsBlock += result.accountData.isAdmin || result.accountRights.remove_articles || (result.accountRights.remove_own_articles && newsData.authorUuid === result.accountData.uuid)
      ? `<button onclick="removeArticle()" class="mainNewsBlockArticleActionsRemove">${result.commonStrings.root.news.homePage.removeArticleButton}</button>`
      : `<button class="mainNewsBlockArticleActionsDisabled">${result.commonStrings.root.news.homePage.removeArticleButton}</button>`;

      buttonsBlock += '</div>';

      article.innerHTML = buttonsBlock;
      article.innerHTML += `<div class="mainNewsBlockArticleDate">${newsData.timestamp}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleTitle">${newsData.title}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleContent">${newsData.content}</div>`;
      article.innerHTML += `<div class="mainNewsBlockArticleAuthor">${newsData.author}</div>`;

      var commentsSection   = document.createElement('div');
      var postSection       = document.createElement('div');
      var commentsContainer = document.createElement('div');

      commentsSection     .setAttribute('id', 'mainNewsBlockComments');
      commentsContainer   .setAttribute('id', 'commentsList');
      commentsSection     .setAttribute('class', 'mainNewsBlockComments');
      postSection         .setAttribute('class', 'mainNewsBlockCommentsPostSection');
      commentsContainer   .setAttribute('class', 'mainNewsBlockCommentsContainer');

      postSection.innerHTML += `<button onclick="addCommentOnArticle(null)" class="mainNewsBlockCommentsPostButton">${result.commonStrings.root.news.commentsSection.postCommentButton}</button>`;

      commentsContainer.innerHTML += newsData.comments.length === 0
      ? `<div id="mainNewsBlockCommentsEmptyStack" class="mainNewsBlockCommentsEmptyStack">${result.commonStrings.root.news.commentsSection.emptyCommentsStack}</div>`
      : `<div id="mainNewsBlockCommentsEmptyStack" class="mainNewsBlockCommentsEmptyStack" style="display:none">${result.commonStrings.root.news.commentsSection.emptyCommentsStack}</div>`;

      var buildCommentsSection = (currentComments, commonStrings, callback) =>
      {
        var resultArray = [], index = 0;

        var browse = () =>
        {
          resultArray.push(`<div name="${currentComments[index].commentUuid}" class="mainNewsBlockCommentsElement">`);
          resultArray.push(`<div class="mainNewsBlockCommentsElementHeader">${currentComments[index].commentDate} - ${currentComments[index].commentAuthor}</div>`);
          resultArray.push(`<div class="mainNewsBlockCommentsElementContent">`);
          resultArray.push(`<div class="mainNewsBlockCommentsElementMessage">${currentComments[index].commentContent}</div>`);

          buildCommentsSection(currentComments[index].commentChildren, commonStrings, (result) =>
          {
            if(result != null) resultArray.push(result);

            resultArray.push(`</div>`);
            resultArray.push(`<div class="mainNewsBlockCommentsElementActions">`);
            resultArray.push(`<div onclick="addCommentOnArticle('${currentComments[index].commentUuid}')" class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.answerComment}</div>`);
            resultArray.push(`<div class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.updateComment}</div>`);
            resultArray.push(`<div class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.removeComment}</div>`);
            resultArray.push(`</div></div>`);

            if(currentComments[index += 1] == undefined) return callback(resultArray.join(''));

            browse();
          });
        }

        currentComments.length === 0
        ? callback(null)
        : browse();
      }

      buildCommentsSection(newsData.comments, commonStrings, (result) =>
      {
        if(result != null) commentsContainer.innerHTML += result;

        commentsSection     .appendChild(postSection);
        commentsSection     .appendChild(commentsContainer);

        article.appendChild(commentsSection);

        document.getElementById('asideNewsBlockList').children[0].setAttribute('class', 'asideNewsBlockListElementSelected');
      });
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
      : document.getElementById('mainNewsBlockArticle').innerHTML = `<div class="mainNewsBlockEmpty" id="mainNewsBlockEmpty"><div class="mainNewsBlockEmptyIcon"><i class="far fa-paper-plane"></i></div><div class="mainNewsBlockEmptyMessage">${commonStrings.root.news.homePage.emptyArticles}</div></div>`;
    }
  }

  if(document.getElementById('asideNewsBlockList').children.length === 1) document.getElementById('asideNewsBlockList').innerHTML = `<div id="asideNewsBlockListEmpty" class="asideNewsBlockListEmpty">${commonStrings.root.news.homePage.emptyArticles}</div>`;
  if(document.getElementById('asideNewsDeployBlockList').children.length === 1) document.getElementById('asideNewsDeployBlockList').innerHTML = `<div id="asideNewsDeployBlockListEmpty" class="asideNewsBlockListEmpty">${commonStrings.root.news.homePage.emptyArticles}</div>`;

  displayInfo(commonStrings.root.news.socket.removedArticleMessage, null, 'removedArticleSocket');
});

/****************************************************************************************************/
/* WHEN A COMMENT IS POSTED ON AN ARTICLE */
/****************************************************************************************************/

socket.on('commentPostedOnArticle', (commentData, articleUuid, accountData, accountRights, commonStrings) =>
{
  if(document.getElementById('commentsList') == null) return;
  if(document.getElementById('mainNewsBlockArticle') == null) return;

  if(document.getElementById('mainNewsBlockArticle').getAttribute('name') !== articleUuid) return;

  if(document.getElementById('mainNewsBlockCommentsEmptyStack')) document.getElementById('mainNewsBlockCommentsEmptyStack').style.display = 'none';

  var commentHtml = [];

  commentHtml.push(`<div name="${commentData.commentUuid}" class="mainNewsBlockCommentsElement">`);
  commentHtml.push(`<div class="mainNewsBlockCommentsElementHeader">${commentData.commentDate} - ${commentData.commentAuthor}</div>`);
  commentHtml.push(`<div class="mainNewsBlockCommentsElementContent">`);
  commentHtml.push(`<div class="mainNewsBlockCommentsElementMessage">${commentData.commentContent}</div>`);
  commentHtml.push(`</div>`);
  commentHtml.push(`<div class="mainNewsBlockCommentsElementActions">`);

  commentData.commentRemoved
  ? commentHtml.push(`<div class="mainNewsBlockCommentsElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.answerComment}</div>`)
  : commentHtml.push(`<div onclick="addCommentOnArticle('${commentData.commentUuid}')" class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.answerComment}</div>`);
  
  (accountData.isAdmin || accountRights.update_article_comments || (accountRights.update_article_own_comments && commentData.commentAuthorUuid === accountData.uuid)) && commentData.commentRemoved == false
  ? commentHtml.push(`<div onclick="updateCommentOnArticle('${commentData.commentUuid}')" class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.updateComment}</div>`)
  : commentHtml.push(`<div class="mainNewsBlockCommentsElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.updateComment}</div>`);

  (accountData.isAdmin || accountRights.remove_article_comments || (accountRights.remove_article_own_comments && commentData.commentAuthorUuid === accountData.uuid)) && commentData.commentRemoved == false
  ? commentHtml.push(`<div onclick="removeCommentOnArticle('${commentData.commentUuid}')" class="mainNewsBlockCommentsElementActionsButton">${commonStrings.root.news.commentsSection.removeComment}</div>`)
  : commentHtml.push(`<div class="mainNewsBlockCommentsElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.removeComment}</div>`);

  commentHtml.push(`</div>`);

  if(commentData.commentParent == null) return document.getElementById('commentsList').innerHTML += commentHtml.join('');

  var browseArticleComments = (currentComments) =>
  {
    var index = 0;

    var browseProvidedComments = () =>
    {
      if(currentComments[index].getAttribute('name') === commentData.commentParent) return currentComments[index].children[1].innerHTML += commentHtml.join('');

      var commentChildren = [];

      for(var x = 0; x < currentComments[index].children[1].children.length; x++)
      {
        if(currentComments[index].children[1].children[x].hasAttribute('name')) commentChildren.push(currentComments[index].children[1].children[x]);
      }

      if(commentChildren.length > 0) browseArticleComments(commentChildren);

      if(currentComments[index += 1] != undefined) browseProvidedComments();
    }

    browseProvidedComments();
  }

  var currentComments = [];

  for(var x = 0; x < document.getElementById('commentsList').children.length; x++)
  {
    if(document.getElementById('commentsList').children[x].hasAttribute('name')) currentComments.push(document.getElementById('commentsList').children[x]);
  }

  browseArticleComments(currentComments);
});

/****************************************************************************************************/
/* WHEN A COMMENT IS UPDATED ON AN ARTICLE */
/****************************************************************************************************/

socket.on('commentUpdatedOnArticle', (commentUuid, commentContent, articleUuid, commonStrings) =>
{
  if(document.getElementById('commentsList') == null) return;
  if(document.getElementById('mainNewsBlockArticle') == null) return;

  if(document.getElementById('mainNewsBlockArticle').getAttribute('name') !== articleUuid) return;

  var browseArticleComments = (currentComments) =>
  {
    var index = 0;

    var browseProvidedComments = () =>
    {
      if(currentComments[index].getAttribute('name') === commentUuid) return currentComments[index].children[1].children[0].innerText = commentContent;

      var commentChildren = [];

      for(var x = 0; x < currentComments[index].children[1].children.length; x++)
      {
        if(currentComments[index].children[1].children[x].hasAttribute('name')) commentChildren.push(currentComments[index].children[1].children[x]);
      }

      if(commentChildren.length > 0) browseArticleComments(commentChildren);

      if(currentComments[index += 1] != undefined) browseProvidedComments();
    }

    browseProvidedComments();
  }

  var currentComments = [];

  for(var x = 0; x < document.getElementById('commentsList').children.length; x++)
  {
    if(document.getElementById('commentsList').children[x].hasAttribute('name')) currentComments.push(document.getElementById('commentsList').children[x]);
  }

  browseArticleComments(currentComments);
});

/****************************************************************************************************/
/* WHEN A COMMENT IS REMOVED ON AN ARTICLE */
/****************************************************************************************************/

socket.on('commentRemovedOnArticle', (commentUuid, articleUuid, commonStrings) =>
{
  if(document.getElementById('commentsList') == null) return;
  if(document.getElementById('mainNewsBlockArticle') == null) return;

  if(document.getElementById('mainNewsBlockArticle').getAttribute('name') !== articleUuid) return;

  var browseArticleComments = (currentComments) =>
  {
    var index = 0;

    var browseProvidedComments = () =>
    {
      if(currentComments[index].getAttribute('name') === commentUuid)
      {
        currentComments[index].children[1].children[0].innerText = commonStrings.root.news.articleCommentRemovedContent;
        currentComments[index].children[2].children[0].setAttribute('class', 'mainNewsBlockCommentsElementActionsButtonDisabled');
        currentComments[index].children[2].children[1].setAttribute('class', 'mainNewsBlockCommentsElementActionsButtonDisabled');
        currentComments[index].children[2].children[2].setAttribute('class', 'mainNewsBlockCommentsElementActionsButtonDisabled');

        return;
      }

      var commentChildren = [];

      for(var x = 0; x < currentComments[index].children[1].children.length; x++)
      {
        if(currentComments[index].children[1].children[x].hasAttribute('name')) commentChildren.push(currentComments[index].children[1].children[x]);
      }

      if(commentChildren.length > 0) browseArticleComments(commentChildren);

      if(currentComments[index += 1] != undefined) browseProvidedComments();
    }

    browseProvidedComments();
  }

  var currentComments = [];

  for(var x = 0; x < document.getElementById('commentsList').children.length; x++)
  {
    if(document.getElementById('commentsList').children[x].hasAttribute('name')) currentComments.push(document.getElementById('commentsList').children[x]);
  }

  browseArticleComments(currentComments);
});

/****************************************************************************************************/