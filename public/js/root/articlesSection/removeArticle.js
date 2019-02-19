/****************************************************************************************************/

function removeArticleOpenPrompt(articleUuid)
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

  modalHeaderTitle      .innerText = commonStrings.root.news.removeArticlePopup.title;
  modalContentConfirm   .innerText = commonStrings.root.news.removeArticlePopup.confirm;
  modalContentCancel    .innerText = commonStrings.root.news.removeArticlePopup.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${commonStrings.root.news.removeArticlePopup.message}</div>`;

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
    removeArticleSendToServer(articleUuid);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    checkMessageTag('removeArticleError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function removeArticleSendToServer(articleUuid)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { articleUuid: articleUuid }, url: '/queries/root/news/remove-article', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'removeArticleError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'removeArticleError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    displaySuccess(result.message, null, 'removeArticleSuccess');
  });
}

/****************************************************************************************************/
