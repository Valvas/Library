/****************************************************************************************************/

socket.on('articleCreated', (articleData) =>
{
  document.getElementById('asideArticlesEmpty').removeAttribute('style');

  displayInfo(commonStrings.root.news.socket.articleCreated.replace('$[1]', `<b>${articleData.title}</b>`), null, 'createdArticleSocket');

  const asideListArticles = document.getElementById('asideArticlesList').children;

  var alreadyInTheList = false;

  for(var x = 0; x < asideListArticles.length; x++)
  {
    if(asideListArticles[x].getAttribute('name') === articleData.uuid)
    {
      alreadyInTheList = true;
      break;
    }
  }

  if(alreadyInTheList == false)
  {
    var newArticle = document.createElement('li');

    newArticle      .addEventListener('click', () =>
    {
      urlParameters = ['display', articleData.uuid];
      loadLocation('news');
    });

    newArticle      .setAttribute('name', articleData.uuid);
    newArticle      .setAttribute('class', 'asideArticlesListElement');

    newArticle      .innerHTML = `<div class="asideArticlesListElementDate">${articleData.timestamp}</div><div class="asideArticlesListElementTitle">${articleData.title}</div>`;

    document.getElementById('asideArticlesList').insertBefore(newArticle, document.getElementById('asideArticlesList').children[0]);
  }

  if(currentLocation === 'news' && urlParameters[0] === 'display')
  {
    if(document.getElementById('articleBlock').getAttribute('name') !== articleData.articleUuid)
    {
      urlParameters = ['display'];
      loadLocation('news');
    }
  }
});

/****************************************************************************************************/

socket.on('articleUpdated', (articleData) =>
{
  const articlesInList = document.getElementById('asideArticlesList').children;

  for(var x = 0; x < articlesInList.length; x++)
  {
    if(articlesInList[x].getAttribute('name') !== articleData.articleUuid) continue;

    displayInfo(commonStrings.root.news.socket.articleUpdated.replace('$[1]', `<b>${articlesInList[x].children[1].innerText}</b>`), null, 'updatedArticleSocket');

    articlesInList[x].children[1].innerText = articleData.articleTitle;
  }

  if(currentLocation === 'news' && urlParameters[0] === 'display')
  {
    if(document.getElementById('articleBlock').getAttribute('name') === articleData.articleUuid)
    {
      urlParameters = ['display', articleData.articleUuid];
      loadLocation('news');
    }
  }
});

/****************************************************************************************************/

socket.on('articleRemoved', (articleUuid) =>
{
  const articlesInList = document.getElementById('asideArticlesList').children;

  for(var x = 0; x < articlesInList.length; x++)
  {
    if(articlesInList[x].getAttribute('name') !== articleUuid) continue;

    displayInfo(commonStrings.root.news.socket.articleRemoved.replace('$[1]', `<b>${articlesInList[x].children[1].innerText}</b>`), null, 'removedArticleSocket');

    articlesInList[x].remove();

    if(articlesInList.length === 0) document.getElementById('asideArticlesEmpty').style.display = 'block';
  }

  if(currentLocation === 'news' && urlParameters[0] === 'display')
  {
    if(document.getElementById('articleBlock').getAttribute('name') === articleUuid)
    {
      urlParameters = ['display'];
      loadLocation('news');
    }
  }
});

/****************************************************************************************************/

socket.on('articleCommentPosted', (commentData) =>
{
  if(document.getElementById('articleBlock') == null) return;
  if(document.getElementById('articleBlock').getAttribute('name') !== commentData.commentArticle) return;

  document.getElementById('articleBlockCommentsEmpty').removeAttribute('style');

  var newComment      = document.createElement('div');
  var commentContent  = document.createElement('div');
  var commentActions  = document.createElement('div');

  newComment          .setAttribute('id', commentData.commentUuid)
  newComment          .setAttribute('class', 'articleBlockCommentsListElement');
  commentContent      .setAttribute('class', 'articleBlockCommentsListElementContent');
  commentActions      .setAttribute('class', 'articleBlockCommentsListElementActions');

  newComment          .innerHTML += `<div class="articleBlockCommentsListElementHeader">${commentData.commentDate} - ${commentData.commentAuthor}</div>`;
  commentContent      .innerHTML += `<div class="articleBlockCommentsListElementContentMessage">${commentData.commentContent}</div>`;
  commentActions      .innerHTML += `<div class="articleBlockCommentsListElementActionsButton" onclick="postArticleCommentOpenPrompt('${commentData.commentArticle}', '${commentData.commentUuid}')">${commonStrings.root.news.commentsSection.answerComment}</div>`;

  if(intranetRights.updateArticleComments || (commentData.commentAuthorUuid === accountData.uuid && intranetRights.updateArticleOwnComments))
  {
    commentActions    .innerHTML += `<div class="articleBlockCommentsListElementActionsButton" onclick="updateArticleCommentOpenPrompt('${commentData.commentArticle}', '${commentData.commentUuid}')">${commonStrings.root.news.commentsSection.updateComment}</div>`;
  }

  if(intranetRights.removeArticleComments || (commentData.commentAuthorUuid === accountData.uuid && intranetRights.removeArticleOwnComments))
  {
    commentActions    .innerHTML += `<div class="articleBlockCommentsListElementActionsButton" onclick="removeArticleCommentOpenPrompt('${commentData.commentArticle}', '${commentData.commentUuid}')">${commonStrings.root.news.commentsSection.removeComment}</div>`;
  }

  newComment          .appendChild(commentContent);
  newComment          .appendChild(commentActions);

  if(commentData.commentParent == null)
  {
    return document.getElementById('articleBlockCommentsList').appendChild(newComment);
  }

  if(document.getElementById(commentData.commentParent))
  {
    return document.getElementById(commentData.commentParent).getElementsByClassName('articleBlockCommentsListElementContent')[0].appendChild(newComment);
  }
});

/****************************************************************************************************/

socket.on('articleCommentUpdated', (commentData) =>
{
  if(document.getElementById(commentData.commentUuid) == null) return;
  if(document.getElementById(commentData.commentUuid).getAttribute('class') !== 'articleBlockCommentsListElement') return;

  document.getElementById(commentData.commentUuid).children[0].innerText = `${commentData.commentDate} - ${commentData.commentAuthor} (${commonStrings.root.news.commentsSection.updatedComment})`;

  document.getElementById(commentData.commentUuid).children[1].children[0].innerText = commentData.commentContent;

  document.getElementById(commentData.commentUuid).children[2].innerHTML = `<div class="articleBlockCommentsListElementActionsButton" onclick="postArticleCommentOpenPrompt('${commentData.commentArticle}', '${commentData.commentUuid}')">${commonStrings.root.news.commentsSection.answerComment}</div>`;

  if(intranetRights.updateArticleComments || (commentData.commentAuthorUuid === accountData.uuid && intranetRights.updateArticleOwnComments))
  {
    document.getElementById(commentData.commentUuid).children[2].innerHTML += `<div class="articleBlockCommentsListElementActionsButton" onclick="updateArticleCommentOpenPrompt('${commentData.commentArticle}', '${commentData.commentUuid}')">${commonStrings.root.news.commentsSection.updateComment}</div>`;
  }

  if(intranetRights.removeArticleComments || (commentData.commentAuthorUuid === accountData.uuid && intranetRights.removeArticleOwnComments))
  {
    document.getElementById(commentData.commentUuid).children[2].innerHTML += `<div class="articleBlockCommentsListElementActionsButton" onclick="removeArticleCommentOpenPrompt('${commentData.commentArticle}', '${commentData.commentUuid}')">${commonStrings.root.news.commentsSection.removeComment}</div>`;
  }

  displayInfo(commonStrings.root.news.socket.articleCommentUpdated, null, 'articleCommentUpdatedSocket');
});

/****************************************************************************************************/

socket.on('articleCommentRemoved', (commentUuid) =>
{
  if(document.getElementById(commentUuid) == null) return;
  if(document.getElementById(commentUuid).getAttribute('class') !== 'articleBlockCommentsListElement') return;

  const commentCurrentHeader = document.getElementById(commentUuid).children[0].innerText;

  const commentNewHeader = `${commentCurrentHeader.split('(')[0].trim()} (${commonStrings.root.news.commentsSection.removedComment})`;

  document.getElementById(commentUuid).children[0].innerText = commentNewHeader;

  document.getElementById(commentUuid).children[1].children[0].innerText = '...';

  document.getElementById(commentUuid).children[2].innerHTML = `<div class="articleBlockCommentsListElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.answerComment}</div>`;

  displayInfo(commonStrings.root.news.socket.articleCommentRemoved, null, 'articleCommentRemovedSocket');
});

/****************************************************************************************************/
