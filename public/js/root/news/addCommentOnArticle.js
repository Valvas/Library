/****************************************************************************************************/

var commonAppStrings = null;

/****************************************************************************************************/

function addCommentOnArticle(commentUuid)
{
  if(document.getElementById('addCommentToArticleBackground') != null) return;

  createBackground('addCommentToArticleBackground');

  if(commonAppStrings != null) return addCommentOnArticleOpenPopup(commentUuid);

  displayLoader('', (loader) =>
  {
    return addCommentOnArticleGetStrings(commentUuid, loader);
  });
}

/****************************************************************************************************/

function addCommentOnArticleGetStrings(commentUuid, loader)
{
  getCommonStrings((error, strings) =>
  {
    removeLoader(loader, () => {  });

    if(error != null)
    {
      removeBackground('addCommentToArticleBackground');

      return displayError(error.message, error.detail, 'addCommentToArticleError');
    }

    commonAppStrings = strings;

    return addCommentOnArticleOpenPopup(commentUuid);
  });
}

/****************************************************************************************************/

function addCommentOnArticleOpenPopup(commentUuid)
{
  var back    = document.createElement('div');
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  back      .setAttribute('id', 'articleCommentBackground');
  popup     .setAttribute('id', 'articleCommentPopup');

  back      .setAttribute('class', 'articleCommentBackground');
  popup     .setAttribute('class', 'articleCommentPopup');

  popup.innerHTML += commentUuid == null
  ? `<div class="articleCommentPopupTitle">${commonAppStrings.root.news.homePage.commentPopup.addCommentTitle}</div>`
  : `<div class="articleCommentPopupTitle">${commonAppStrings.root.news.homePage.commentPopup.replyCommentTitle}</div>`;

  popup     .innerHTML += `<div id="addCommentToArticleEmpty" class="articleCommentPopupError">${commonAppStrings.root.news.homePage.commentPopup.emptyComment}</div>`;
  popup     .innerHTML += `<div id="addCommentToArticleInput" class="articleCommentPopupInput" contenteditable="true"></div>`;

  confirm   .innerText = commonAppStrings.root.news.homePage.commentPopup.sendButton;
  cancel    .innerText = commonAppStrings.root.news.homePage.commentPopup.cancelButton;

  buttons   .setAttribute('class', 'articleCommentPopupButtons');
  confirm   .setAttribute('class', 'articleCommentPopupConfirm');
  cancel    .setAttribute('class', 'articleCommentPopupCancel');

  confirm   .addEventListener('click', () =>
  {
    const commentContent = document.getElementById('addCommentToArticleInput').innerText;

    return addCommentOnArticleOpenConfirmation(commentUuid, commentContent);
  });

  cancel    .addEventListener('click', () =>
  {
    back.remove();
    removeBackground('addCommentToArticleBackground');
  });

  buttons   .appendChild(confirm);
  buttons   .appendChild(cancel);
  popup     .appendChild(buttons);
  back      .appendChild(popup);

  document.body.appendChild(back);
}

/****************************************************************************************************/

function addCommentOnArticleOpenConfirmation(commentUuid, commentContent)
{
  document.getElementById('addCommentToArticleEmpty').removeAttribute('style');

  if(new RegExp('^(\\S)+((\\s*)?(\\S)+)*$').test(commentContent) == false) return document.getElementById('addCommentToArticleEmpty').style.display = 'block';

  document.getElementById('articleCommentPopup').style.display = 'none';

  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup     .setAttribute('class', 'standardPopup');
  buttons   .setAttribute('class', 'standardPopupButtons');
  confirm   .setAttribute('class', 'standardPopupConfirm');
  cancel    .setAttribute('class', 'standardPopupCancel');

  confirm   .innerText = commonAppStrings.root.news.homePage.commentPopup.confirmationSend;
  cancel    .innerText = commonAppStrings.root.news.homePage.commentPopup.confirmationCancel;

  confirm   .addEventListener('click', () =>
  {
    popup.remove();

    displayLoader(commonAppStrings.root.news.homePage.commentPopup.commentSavingMessage, (loader) =>
    {
      return addCommentOnArticleSendDataToServer(commentUuid, commentContent, loader);
    });
  });

  cancel    .addEventListener('click', () =>
  {
    popup.remove();
    document.getElementById('articleCommentPopup').removeAttribute('style');
  });

  popup     .innerHTML += `<div class="standardPopupTitle">${commonAppStrings.root.news.homePage.commentPopup.confirmationTitle}</div>`;
  popup     .innerHTML += `<div class="standardPopupMessage">${commonAppStrings.root.news.homePage.commentPopup.confirmationMessage}</div>`;

  buttons   .appendChild(confirm);
  buttons   .appendChild(cancel);
  popup     .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function addCommentOnArticleSendDataToServer(commentUuid, commentContent, loader)
{
  $.ajax(
  {
    method: 'POST', dataType: 'json', timeout: 10000, data: { commentParent: commentUuid, commentContent: commentContent, articleUuid: document.getElementById('mainNewsBlockArticle').getAttribute('name') }, url: '/queries/root/news/add-comment-on-article',

    error: (xhr, textStatus, errorThrown) =>
    {
      removeLoader(loader, () => {  });

      document.getElementById('articleCommentPopup').removeAttribute('style');

      xhr.responseJSON != undefined
      ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'addCommentToArticleError')
      : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'addCommentToArticleError');
    }

  }).done((result) =>
  {
    removeLoader(loader, () => {  });

    document.getElementById('articleCommentBackground').remove();

    removeBackground('addCommentToArticleBackground');

    displaySuccess(result.message, null, 'addCommentToArticleSuccess');
  });
}

/****************************************************************************************************/