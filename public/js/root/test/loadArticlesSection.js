/****************************************************************************************************/

function loadArticlesSection()
{
  displayLocationLoader();

  var articlesContainer    = document.createElement('div');

  articlesContainer        .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.news}</div>`;

  articlesContainer        .setAttribute('class', 'articlesSectionBlock');

  articlesContainer        .style.display = 'none';

  document.getElementById('locationContent').appendChild(articlesContainer);

  if(urlParameters[0] == undefined) urlParameters.push('display');

  switch(urlParameters[0])
  {
    case 'display':

      if(urlParameters[1] != undefined)
      {
        loadArticlesSectionDisplayArticle(urlParameters[1], (error, content) =>
        {
          error == null
          ? articlesContainer.appendChild(content)
          : displayError(error.message, error.detail, 'loadArticlesSectionError');

          if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

          $(articlesContainer).fadeIn(250);
        });
      }

      else if(document.getElementById('asideArticlesList').children.length > 0)
      {
        loadArticlesSectionDisplayArticle(document.getElementById('asideArticlesList').children[0].getAttribute('name'), (error, content) =>
        {
          error == null
          ? articlesContainer.appendChild(content)
          : displayError(error.message, error.detail, 'loadArticlesSectionError');

          if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

          $(articlesContainer).fadeIn(250);
        });
      }

      else
      {
        articlesContainer.innerHTML += `<div class="articlesSectionEmpty">${commonStrings.articles.aside.emptyList}</div>`;

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(articlesContainer).fadeIn(250);
      }

    break;

    default:

      displayError(commonStrings.notFound, null, 'notFoundError');
      urlParameters = [];
      loadLocation('home');

    break;
  }
}

/****************************************************************************************************/

function loadArticlesSectionDisplayArticle(articleUuid, callback)
{
  $.ajax(
  {
    type: 'PUT', timeout: 10000, data: { newsUuid: articleUuid }, dataType: 'JSON', url: '/queries/root/news/get-news-data', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    console.log(result);

    const currentArticle = result.newsData;

    var articleBlock    = document.createElement('div');
    var articleFlex     = document.createElement('div');
    var blockHeader     = document.createElement('div');
    var headerActions   = document.createElement('div');
    var actionsCreate   = document.createElement('button');
    var actionsUpdate   = document.createElement('button');
    var actionsRemove   = document.createElement('button');
    var headerTitle     = document.createElement('div');
    var headerInfos     = document.createElement('div');
    var blockContent    = document.createElement('div');
    var blockComments   = document.createElement('div');
    var commentsAdd     = document.createElement('div');

    articleBlock        .setAttribute('class', 'articleBlock');
    articleFlex         .setAttribute('class', 'articleBlockFlex');
    blockHeader         .setAttribute('class', 'articleBlockHeader');
    headerActions       .setAttribute('class', 'articleBlockHeaderActions');
    actionsCreate       .setAttribute('class', 'articleBlockHeaderActionsCreate');
    actionsUpdate       .setAttribute('class', 'articleBlockHeaderActionsUpdate');
    actionsRemove       .setAttribute('class', 'articleBlockHeaderActionsRemove');
    headerTitle         .setAttribute('class', 'articleBlockHeaderTitle');
    headerInfos         .setAttribute('class', 'articleBlockHeaderInfos');
    blockContent        .setAttribute('class', 'articleBlockContent');
    blockComments       .setAttribute('class', 'articleBlockComments');
    commentsAdd         .setAttribute('class', 'articleBlockCommentsAdd');

    const headerInfosMessage = commonStrings.root.news.headerInfoMessage.replace('$[1]', currentArticle.author).replace('$[2]', currentArticle.timestamp);

    actionsCreate       .innerText = commonStrings.root.news.homePage.createArticleSection.createArticleButton;
    actionsUpdate       .innerText = commonStrings.root.news.homePage.updateArticleButton;
    actionsRemove       .innerText = commonStrings.root.news.homePage.removeArticleButton;
    headerTitle         .innerText = currentArticle.title;
    headerInfos         .innerText = headerInfosMessage;
    blockContent        .innerHTML = currentArticle.content;
    commentsAdd         .innerHTML = `<button>${commonStrings.root.news.commentsSection.postCommentButton}</button>`;

    headerActions       .appendChild(actionsCreate);
    headerActions       .appendChild(actionsUpdate);
    headerActions       .appendChild(actionsRemove);
    blockHeader         .appendChild(headerActions);
    blockHeader         .appendChild(headerTitle);
    blockHeader         .appendChild(headerInfos);
    blockComments       .appendChild(commentsAdd);
    articleFlex         .appendChild(blockHeader);
    articleFlex         .appendChild(blockContent);
    articleFlex         .appendChild(blockComments);
    articleBlock        .appendChild(articleFlex);

    loadArticlesSectionBuildCommentSection(currentArticle.comments, (error, commentsContent) =>
    {
      if(error != null) return callback(error);

      blockComments     .appendChild(commentsContent);

      return callback(null, articleBlock);
    });
  });
}

/****************************************************************************************************/

function loadArticlesSectionBuildCommentSection(comments, callback)
{
  var commentSection    = document.createElement('div');
  var commentsEmpty     = document.createElement('div');
  var commentsList      = document.createElement('div');

  commentSection        .setAttribute('class', 'articleBlockCommentsContainer');
  commentsEmpty         .setAttribute('class', 'articleBlockCommentsEmpty');
  commentsList          .setAttribute('class', 'articleBlockCommentsList');

  commentsEmpty         .setAttribute('id', 'articleBlockCommentsEmpty');
  commentsList          .setAttribute('id', 'articleBlockCommentsList');

  var browseComments = (browsedComments, index, parentElement) =>
  {
    var currentComment  = document.createElement('div');
    var commentContent  = document.createElement('div');

    currentComment      .setAttribute('class', 'articleBlockCommentsListElement');
    commentContent      .setAttribute('class', 'articleBlockCommentsListElementContent');

    currentComment      .innerHTML += `<div class="articleBlockCommentsListElementHeader">${browsedComments[index].commentDate} - ${browsedComments[index].commentAuthor}</div>`;
    commentContent      .innerHTML += `<div class="articleBlockCommentsListElementContentMessage">${browsedComments[index].commentContent}</div>`;

    currentComment      .appendChild(commentContent);
    parentElement       .appendChild(currentComment);

    if(browsedComments[index].commentChildren.length > 0) browseComments(browsedComments[index].commentChildren, 0, commentContent);

    if(browsedComments[index += 1] != undefined) browseComments(browsedComments, index, parentElement);
  }

  if(comments.length > 0) browseComments(comments, 0, commentsList);

  commentsEmpty         .innerText = commonStrings.root.news.commentsSection.emptyCommentsStack;

  commentSection        .appendChild(commentsEmpty);
  commentSection        .appendChild(commentsList);

  if(comments.length === 0)
  {
    commentsEmpty       .style.display = 'block';
  }

  return callback(null, commentSection);
}

/****************************************************************************************************/
