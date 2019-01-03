/****************************************************************************************************/

var commonAppStrings = null;

/****************************************************************************************************/

function removeCommentOnArticle(commentUuid)
{
  if(document.getElementById('removeCommentOnArticleBackground') != null) return;

  createBackground('removeCommentOnArticleBackground');

  if(commonAppStrings != null) return removeCommentOnArticleOpenPopup(commentUuid);

  displayLoader('', (loader) =>
  {
    return removeCommentOnArticleGetStrings(commentUuid, loader);
  });
}

/****************************************************************************************************/

function removeCommentOnArticleGetStrings(commentUuid, loader)
{
  getCommonStrings((error, strings) =>
  {
    removeLoader(loader, () => {  });

    if(error != null)
    {
      removeBackground('removeCommentOnArticleBackground');

      return displayError(error.message, error.detail, 'removeCommentOnArticleError');
    }

    commonAppStrings = strings;

    return removeCommentOnArticleOpenPopup(commentUuid);
  });
}

/****************************************************************************************************/

function removeCommentOnArticleOpenPopup(commentUuid)
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup     .setAttribute('class', 'standardPopup');
  buttons   .setAttribute('class', 'standardPopupButtons');
  confirm   .setAttribute('class', 'standardPopupConfirm');
  cancel    .setAttribute('class', 'standardPopupCancel');

  confirm   .innerText = commonAppStrings.root.news.homePage.removeComment.confirmButton;
  cancel    .innerText = commonAppStrings.root.news.homePage.removeComment.cancelButton;

  confirm   .addEventListener('click', () =>
  {
    popup.remove();

    displayLoader(commonAppStrings.root.news.homePage.removeComment.loadingMessage, (loader) =>
    {
      return removeCommentOnArticleSendDataToServer(commentUuid, loader);
    });
  });

  cancel    .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('removeCommentOnArticleBackground');
  });

  popup     .innerHTML += `<div class="standardPopupTitle">${commonAppStrings.root.news.homePage.removeComment.confirmationTitle}</div>`;
  popup     .innerHTML += `<div class="standardPopupMessage">${commonAppStrings.root.news.homePage.removeComment.confirmationMessage}</div>`;

  buttons   .appendChild(confirm);
  buttons   .appendChild(cancel);
  popup     .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function removeCommentOnArticleSendDataToServer(commentUuid, loader)
{
  $.ajax(
  {
    method: 'DELETE', dataType: 'json', timeout: 10000, data: { commentUuid: commentUuid, articleUuid: document.getElementById('mainNewsBlockArticle').getAttribute('name') }, url: '/queries/root/news/remove-comment-on-article',

    error: (xhr, textStatus, errorThrown) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('removeCommentOnArticleBackground');

      xhr.responseJSON != undefined
      ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'removeCommentOnArticleError')
      : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'removeCommentOnArticleError');
    }

  }).done((result) =>
  {
    removeLoader(loader, () => {  });

    removeBackground('removeCommentOnArticleBackground');

    displaySuccess(result.message, null, 'removeCommentOnArticleSuccess');
  });
}

/****************************************************************************************************/