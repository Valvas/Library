/****************************************************************************************************/

function loadArticlesSection()
{
  displayLocationLoader();

  history.pushState(null, null, '/news/' + urlParameters.join('/'));

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
        urlParameters.push(document.getElementById('asideArticlesList').children[0].getAttribute('name'));

        history.pushState(null, null, '/news/' + urlParameters.join('/'));

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
        var articleBlock  = document.createElement('div');
        var articleCreate = document.createElement('div');
        var createButton  = document.createElement('button');

        articleBlock      .setAttribute('id', 'articleBlock');
        articleCreate     .setAttribute('class', 'articlesSectionCreateBlock');
        createButton      .setAttribute('class', 'articlesSectionCreateBlockButton');

        createButton      .innerText = commonStrings.root.news.homePage.createArticleSection.createArticleButton;

        createButton      .addEventListener('click', () =>
        {
          urlParameters = ['create'];
          loadLocation('news');
        });

        articleBlock      .innerHTML += `<div class="articlesSectionEmpty">${commonStrings.articles.aside.emptyList}</div>`;

        articleCreate     .appendChild(createButton);

        if(intranetRights.createArticles) articleBlock.appendChild(articleCreate);

        articlesContainer .appendChild(articleBlock);

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(articlesContainer).fadeIn(250);
      }

    break;

    case 'create':

      loadArticleSectionBuildCreationBlock((error, content) =>
      {
        if(error != null) displayError(error.message, error.detail, 'loadArticlesSectionError');

        else
        {
          articlesContainer.appendChild(content);

          const toolbarOptions = [['bold', 'italic', 'underline'], [{ 'color': [] }], [{ 'list': 'ordered'}, { 'list': 'bullet' }]];

          const editor = new Quill('#articleFormContent',
          {
            modules: { toolbar: toolbarOptions },
            theme: 'snow'
          });
        }

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(articlesContainer).fadeIn(250);
      });

    break;

    case 'update':

      loadArticleSectionBuildUpdateBlock(urlParameters[1], (error, content, articleData) =>
      {
        if(error != null) displayError(error.message, error.detail, 'loadArticlesSectionError');

        else
        {
          articlesContainer.appendChild(content);

          const toolbarOptions = [['bold', 'italic', 'underline'], [{ 'color': [] }], [{ 'list': 'ordered'}, { 'list': 'bullet' }]];

          const editor = new Quill('#articleFormContent',
          {
            modules: { toolbar: toolbarOptions },
            theme: 'snow'
          });

          document.getElementById('articleFormTitle').value = articleData.title;
          document.getElementById('articleFormContent').children[0].innerHTML = articleData.content;
        }

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(articlesContainer).fadeIn(250);
      });

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
    headerTitle         .setAttribute('class', 'articleBlockHeaderTitle');
    headerInfos         .setAttribute('class', 'articleBlockHeaderInfos');
    blockContent        .setAttribute('class', 'articleBlockContent');
    blockComments       .setAttribute('class', 'articleBlockComments');
    commentsAdd         .setAttribute('class', 'articleBlockCommentsAdd');

    articleBlock        .setAttribute('id', 'articleBlock');
    articleBlock        .setAttribute('name', articleUuid);

    intranetRights.createArticles
    ? actionsCreate     .setAttribute('class', 'articleBlockHeaderActionsCreate')
    : actionsCreate     .setAttribute('class', 'articleBlockHeaderActionsDisabled')

    intranetRights.updateArticles
    ? actionsUpdate     .setAttribute('class', 'articleBlockHeaderActionsUpdate')
    : currentArticle.authorUuid !== accountData.uuid
      ? actionsUpdate   .setAttribute('class', 'articleBlockHeaderActionsDisabled')
      : intranetRights.updateOwnArticles
        ? actionsUpdate .setAttribute('class', 'articleBlockHeaderActionsUpdate')
        : actionsUpdate .setAttribute('class', 'articleBlockHeaderActionsDisabled');

    intranetRights.removeArticles
    ? actionsRemove     .setAttribute('class', 'articleBlockHeaderActionsRemove')
    : currentArticle.authorUuid !== accountData.uuid
      ? actionsRemove   .setAttribute('class', 'articleBlockHeaderActionsDisabled')
      : intranetRights.removeOwnArticles
        ? actionsRemove .setAttribute('class', 'articleBlockHeaderActionsRemove')
        : actionsRemove .setAttribute('class', 'articleBlockHeaderActionsDisabled');

    if(intranetRights.createArticles)
    {
      actionsCreate.addEventListener('click', () =>
      {
        urlParameters = ['create'];
        loadLocation('news');
      });
    }

    if(intranetRights.updateArticles || (currentArticle.authorUuid === accountData.uuid && intranetRights.updateOwnArticles))
    {
      actionsUpdate.addEventListener('click', () =>
      {
        urlParameters = ['update', currentArticle.uuid];
        loadLocation('news');
      });
    }

    if(intranetRights.removeArticles || (currentArticle.authorUuid === accountData.uuid && intranetRights.removeOwnArticles))
    {
      actionsRemove.setAttribute('onclick', `removeArticleOpenPrompt("${currentArticle.uuid}")`);
    }

    const headerInfosMessage = commonStrings.root.news.headerInfoMessage.replace('$[1]', currentArticle.author).replace('$[2]', currentArticle.timestamp);

    actionsCreate       .innerText = commonStrings.root.news.homePage.createArticleSection.createArticleButton;
    actionsUpdate       .innerText = commonStrings.root.news.homePage.updateArticleButton;
    actionsRemove       .innerText = commonStrings.root.news.homePage.removeArticleButton;
    headerTitle         .innerText = currentArticle.title;
    headerInfos         .innerText = headerInfosMessage;
    blockContent        .innerHTML = currentArticle.content;
    commentsAdd         .innerHTML = `<button onclick="postArticleCommentOpenPrompt('${currentArticle.uuid}',null)">${commonStrings.root.news.commentsSection.postCommentButton}</button>`;

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

    loadArticlesSectionBuildCommentSection(currentArticle.uuid, currentArticle.comments, (error, commentsContent) =>
    {
      if(error != null) return callback(error);

      blockComments     .appendChild(commentsContent);

      return callback(null, articleBlock);
    });
  });
}

/****************************************************************************************************/

function loadArticlesSectionBuildCommentSection(currentArticleUuid, comments, callback)
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
    var commentActions  = document.createElement('div');

    currentComment      .setAttribute('id', browsedComments[index].commentUuid);

    currentComment      .setAttribute('class', 'articleBlockCommentsListElement');
    commentContent      .setAttribute('class', 'articleBlockCommentsListElementContent');
    commentActions      .setAttribute('class', 'articleBlockCommentsListElementActions');

    currentComment      .innerHTML += browsedComments[index].commentRemoved
    ? `<div class="articleBlockCommentsListElementHeader">${browsedComments[index].commentDate} - ${browsedComments[index].commentAuthor} (${commonStrings.root.news.commentsSection.removedComment})</div>`
    : browsedComments[index].commentUpdated
      ? `<div class="articleBlockCommentsListElementHeader">${browsedComments[index].commentDate} - ${browsedComments[index].commentAuthor} (${commonStrings.root.news.commentsSection.updatedComment})</div>`
      : `<div class="articleBlockCommentsListElementHeader">${browsedComments[index].commentDate} - ${browsedComments[index].commentAuthor}</div>`;

    commentActions      .innerHTML += browsedComments[index].commentRemoved
    ? `<div class="articleBlockCommentsListElementActionsButtonDisabled">${commonStrings.root.news.commentsSection.answerComment}</div>`
    : `<div class="articleBlockCommentsListElementActionsButton" onclick="postArticleCommentOpenPrompt('${currentArticleUuid}', '${browsedComments[index].commentUuid}')">${commonStrings.root.news.commentsSection.answerComment}</div>`;

    commentContent      .innerHTML += browsedComments[index].commentRemoved
    ? `<div class="articleBlockCommentsListElementContentMessage">...</div>`
    : `<div class="articleBlockCommentsListElementContentMessage">${browsedComments[index].commentContent}</div>`;

    if(browsedComments[index].commentRemoved == false && (intranetRights.updateArticleComments || (browsedComments[index].commentAuthorUuid === accountData.uuid && intranetRights.updateArticleOwnComments)))
    {
      commentActions    .innerHTML += `<div class="articleBlockCommentsListElementActionsButton" onclick="updateArticleCommentOpenPrompt('${currentArticleUuid}', '${browsedComments[index].commentUuid}')">${commonStrings.root.news.commentsSection.updateComment}</div>`;
    }

    if(browsedComments[index].commentRemoved == false && (intranetRights.removeArticleComments || (browsedComments[index].commentAuthorUuid === accountData.uuid && intranetRights.removeArticleOwnComments)))
    {
      commentActions    .innerHTML += `<div class="articleBlockCommentsListElementActionsButton" onclick="removeArticleCommentOpenPrompt('${currentArticleUuid}', '${browsedComments[index].commentUuid}')">${commonStrings.root.news.commentsSection.removeComment}</div>`;
    }

    currentComment      .appendChild(commentContent);
    currentComment      .appendChild(commentActions);
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

function loadArticleSectionBuildCreationBlock(callback)
{
  var container     = document.createElement('div');
  var containerForm = document.createElement('form');
  var formContent   = document.createElement('div');
  var formButtons   = document.createElement('div');
  var buttonsSubmit = document.createElement('button');
  var buttonsCancel = document.createElement('button');

  formContent       .setAttribute('id', 'articleFormContent');

  container         .setAttribute('class', 'articleBlock');
  containerForm     .setAttribute('class', 'articleBlockForm');
  formContent       .setAttribute('class', 'articleBlockFormContent');
  formButtons       .setAttribute('class', 'articleBlockFormButtons');
  buttonsSubmit     .setAttribute('class', 'articleBlockFormSubmit');
  buttonsCancel     .setAttribute('class', 'articleBlockFormCancel');

  buttonsSubmit     .innerText = commonStrings.global.save;
  buttonsCancel     .innerText = commonStrings.global.cancel;

  containerForm     .addEventListener('submit', createArticleCheckFormat);

  buttonsCancel     .addEventListener('click', () =>
  {
    event.preventDefault();

    urlParameters = ['display'];
    loadLocation('news');
  });

  containerForm     .innerHTML = `<input id="articleFormTitle" type="text" class="articleBlockFormTitle" placeholder="${commonStrings.root.news.create.titleLabel}" required />`;

  formButtons       .appendChild(buttonsSubmit);
  formButtons       .appendChild(buttonsCancel);
  containerForm     .appendChild(formContent);
  containerForm     .appendChild(formButtons);
  container         .appendChild(containerForm);

  return callback(null, container);
}

/****************************************************************************************************/

function loadArticleSectionBuildUpdateBlock(articleUuid, callback)
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
    var container     = document.createElement('div');
    var containerForm = document.createElement('form');
    var formContent   = document.createElement('div');
    var formButtons   = document.createElement('div');
    var buttonsSubmit = document.createElement('button');
    var buttonsCancel = document.createElement('button');

    formContent       .setAttribute('id', 'articleFormContent');

    containerForm     .setAttribute('name', result.newsData.uuid);

    container         .setAttribute('class', 'articleBlock');
    containerForm     .setAttribute('class', 'articleBlockForm');
    formContent       .setAttribute('class', 'articleBlockFormContent');
    formButtons       .setAttribute('class', 'articleBlockFormButtons');
    buttonsSubmit     .setAttribute('class', 'articleBlockFormSubmit');
    buttonsCancel     .setAttribute('class', 'articleBlockFormCancel');

    buttonsSubmit     .innerText = commonStrings.global.save;
    buttonsCancel     .innerText = commonStrings.global.cancel;

    containerForm     .addEventListener('submit', updateArticleCheckFormat);

    buttonsCancel     .addEventListener('click', () =>
    {
      event.preventDefault();

      urlParameters = ['display', articleUuid];
      loadLocation('news');
    });

    containerForm     .innerHTML = `<input id="articleFormTitle" type="text" class="articleBlockFormTitle" placeholder="${commonStrings.root.news.create.titleLabel}" required />`;

    formButtons       .appendChild(buttonsSubmit);
    formButtons       .appendChild(buttonsCancel);
    containerForm     .appendChild(formContent);
    containerForm     .appendChild(formButtons);
    container         .appendChild(containerForm);

    return callback(null, container, result.newsData);
  });
}

/****************************************************************************************************/
