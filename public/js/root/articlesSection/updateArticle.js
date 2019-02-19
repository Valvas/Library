/****************************************************************************************************/

function updateArticleCheckFormat(event)
{
  event.preventDefault();

  const articleUuid = event.target.getAttribute('name');
  const articleTitle = document.getElementById('articleFormTitle').value.trim();
  const articleContent = document.getElementById('articleFormContent').children[0].innerHTML;

  if(articleTitle.length === 0) return displayError(commonStrings.root.news.create.emptyTitle, null, 'updateArticleError');

  if(document.getElementById('articleFormContent').children[0].innerText.length < 64) return displayError(commonStrings.root.news.create.emptyContent, null, 'updateArticleError');

  return updateArticleOpenPrompt(articleUuid, articleTitle, articleContent);
}

/****************************************************************************************************/

function updateArticleOpenPrompt(articleUuid, articleTitle, articleContent)
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

  modalHeaderTitle      .innerText = commonStrings.root.news.updateArticlePopup.title;
  modalContentConfirm   .innerText = commonStrings.root.news.updateArticlePopup.confirm;
  modalContentCancel    .innerText = commonStrings.root.news.updateArticlePopup.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${commonStrings.root.news.updateArticlePopup.message}</div>`;

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
    updateArticleSendToServer(articleUuid, articleTitle, articleContent);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    checkMessageTag('updateArticleError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updateArticleSendToServer(articleUuid, articleTitle, articleContent)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { articleUuid: articleUuid, articleTitle: articleTitle, articleContent: articleContent }, url: '/queries/root/news/update-article', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateArticleError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateArticleError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    displaySuccess(result.message, null, 'updateArticleSuccess');

    urlParameters = ['display', articleUuid];
    loadLocation('news');
  });
}

/****************************************************************************************************/
