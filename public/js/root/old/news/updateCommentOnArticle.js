/****************************************************************************************************/

var commonAppStrings = null;

/****************************************************************************************************/

function updateCommentOnArticle(commentUuid)
{
  if(document.getElementById('updateCommentOnArticleBackground') != null) return;

  createBackground('updateCommentOnArticleBackground');

  if(commonAppStrings != null) return updateCommentOnArticleGetDataFromServer(commentUuid);

  displayLoader('', (loader) =>
  {
    return updateCommentOnArticleGetStrings(commentUuid, loader);
  });
}

/****************************************************************************************************/

function updateCommentOnArticleGetStrings(commentUuid, loader)
{
  getCommonStrings((error, strings) =>
  {
    removeLoader(loader, () =>
    {
      if(error != null)
      {
        removeBackground('updateCommentOnArticleBackground');

        return displayError(error.message, error.detail, 'updateCommentOnArticleError');
      }

      commonAppStrings = strings;

      return updateCommentOnArticleGetDataFromServer(commentUuid);
    });
  });
}

/****************************************************************************************************/

function updateCommentOnArticleGetDataFromServer(commentUuid)
{
  displayLoader(commonAppStrings.root.news.retrieveCommentDataFromServer, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { commentUuid: commentUuid }, url: '/queries/root/news/get-comment-data',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });
  
        removeBackground('updateCommentOnArticleBackground');
  
        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateCommentOnArticleError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateCommentOnArticleError');
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      return updateCommentOnArticleOpenPopup(result.commentData);
    });
  });
}

/****************************************************************************************************/

function updateCommentOnArticleOpenPopup(commentData)
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

  popup.innerHTML += `<div class="articleCommentPopupTitle">${commonAppStrings.root.news.homePage.commentPopup.updateCommentTitle}</div>`;

  popup     .innerHTML += `<div id="updateCommentOnArticleEmpty" class="articleCommentPopupError">${commonAppStrings.root.news.homePage.commentPopup.emptyComment}</div>`;
  popup     .innerHTML += `<div id="updateCommentOnArticleInput" class="articleCommentPopupInput" contenteditable="true">${commentData.commentContent}</div>`;

  confirm   .innerText = commonAppStrings.root.news.homePage.commentPopup.sendButton;
  cancel    .innerText = commonAppStrings.root.news.homePage.commentPopup.cancelButton;

  buttons   .setAttribute('class', 'articleCommentPopupButtons');
  confirm   .setAttribute('class', 'articleCommentPopupConfirm');
  cancel    .setAttribute('class', 'articleCommentPopupCancel');

  confirm   .addEventListener('click', () =>
  {
    const commentContent = document.getElementById('updateCommentOnArticleInput').innerText;

    return updateCommentOnArticleOpenConfirmation(commentData.commentUuid, commentContent);
  });

  cancel    .addEventListener('click', () =>
  {
    back.remove();
    removeBackground('updateCommentOnArticleBackground');
  });

  buttons   .appendChild(confirm);
  buttons   .appendChild(cancel);
  popup     .appendChild(buttons);
  back      .appendChild(popup);

  document.body.appendChild(back);
}

/****************************************************************************************************/

function updateCommentOnArticleOpenConfirmation(commentUuid, commentContent)
{
  document.getElementById('updateCommentOnArticleEmpty').removeAttribute('style');

  if(new RegExp('^(\\S)+((\\s*)?(\\S)+)*$').test(commentContent) == false) return document.getElementById('updateCommentOnArticleEmpty').style.display = 'block';

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
      return updateCommentOnArticleSendDataToServer(commentUuid, commentContent, loader);
    });
  });

  cancel    .addEventListener('click', () =>
  {
    popup.remove();
    document.getElementById('articleCommentPopup').removeAttribute('style');
  });

  popup     .innerHTML += `<div class="standardPopupTitle">${commonAppStrings.root.news.homePage.commentPopup.confirmationTitle}</div>`;
  popup     .innerHTML += `<div class="standardPopupMessage">${commonAppStrings.root.news.homePage.commentPopup.updateConfirmationMessage}</div>`;

  buttons   .appendChild(confirm);
  buttons   .appendChild(cancel);
  popup     .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function updateCommentOnArticleSendDataToServer(commentUuid, commentContent, loader)
{
  $.ajax(
  {
    method: 'PUT', dataType: 'json', timeout: 10000, data: { commentUuid: commentUuid, commentContent: commentContent, articleUuid: document.getElementById('mainNewsBlockArticle').getAttribute('name') }, url: '/queries/root/news/update-comment-on-article',

    error: (xhr, textStatus, errorThrown) =>
    {
      removeLoader(loader, () => {  });

      document.getElementById('articleCommentPopup').removeAttribute('style');

      xhr.responseJSON != undefined
      ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateCommentOnArticleError')
      : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateCommentOnArticleError');
    }

  }).done((result) =>
  {
    removeLoader(loader, () => {  });

    document.getElementById('articleCommentBackground').remove();

    removeBackground('updateCommentOnArticleBackground');

    displaySuccess(result.message, null, 'updateCommentOnArticleSuccess');
  });
}

/****************************************************************************************************/