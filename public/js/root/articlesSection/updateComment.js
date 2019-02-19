/****************************************************************************************************/

function updateArticleCommentOpenPrompt(articleUuid, commentUuid)
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  var veilBackground        = document.createElement('div');
  var verticalBackground    = document.createElement('div');
  var horizontalBackground  = document.createElement('div');
  var modal                 = document.createElement('div');
  var modalHeader           = document.createElement('div');
  var modalHeaderTitle      = document.createElement('div');
  var modalContent          = document.createElement('div');
  var modalContentButtons   = document.createElement('div');
  var modalContentConfirm   = document.createElement('button');
  var modalContentCancel    = document.createElement('button');

  veilBackground        .setAttribute('id', 'veilBackground');
  verticalBackground    .setAttribute('id', 'modalBackground');

  veilBackground        .setAttribute('class', 'veilBackground');
  verticalBackground    .setAttribute('class', 'modalBackgroundVertical');
  horizontalBackground  .setAttribute('class', 'modalBackgroundHorizontal');
  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalContent          .setAttribute('class', 'baseModalContent');
  modalContentButtons   .setAttribute('class', 'baseModalContentButtons');
  modalContentConfirm   .setAttribute('class', 'baseModalContentButtonsConfirm');
  modalContentCancel    .setAttribute('class', 'baseModalContentButtonsCancel');

  modalHeaderTitle      .innerText = commonStrings.root.news.homePage.commentPopup.updateCommentTitle;
  modalContentConfirm   .innerText = commonStrings.root.news.homePage.commentPopup.sendButton;
  modalContentCancel    .innerText = commonStrings.global.cancel;

  modalContent          .innerHTML = `<div id="updateArticleCommentInput" contenteditable="true" class="articleBlockCommentPopupContent">${document.getElementById(commentUuid).children[1].children[0].innerText}</div>`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalContent          .appendChild(modalContentButtons);
  modalContentButtons   .appendChild(modalContentConfirm);
  modalContentButtons   .appendChild(modalContentCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalContentConfirm   .addEventListener('click', () =>
  {
    updateArticleCommentSendToServer(articleUuid, commentUuid, document.getElementById('updateArticleCommentInput').innerText);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    checkMessageTag('updateArticleCommentError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updateArticleCommentSendToServer(articleUuid, commentUuid, commentContent)
{
  if(commentContent.length === 0) return displayError(commonStrings.root.news.homePage.commentPopup.emptyComment, null, 'updateArticleCommentError');

  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    method: 'PUT', dataType: 'json', timeout: 10000, data: { commentUuid: commentUuid, commentContent: commentContent, articleUuid: articleUuid }, url: '/queries/root/news/update-comment-on-article',
    error: (xhr, textStatus, errorThrown) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateArticleCommentError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateArticleCommentError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    displaySuccess(result.message, null, 'updateArticleCommentSuccess');
  });
}

/****************************************************************************************************/
