/****************************************************************************************************/

var commonAppStrings = null;

/****************************************************************************************************/

function removeArticle()
{
  if(document.getElementById('removeArticleBackground')) return;

  if(document.getElementById('mainNewsBlockArticle') == null) return;

  createBackground('removeArticleBackground');

  if(commonAppStrings != null) return removeArticleOpenConfirmation();

  displayLoader('', (loader) =>
  {
    return removeArticleGetStrings(loader);
  });
}

/****************************************************************************************************/

function removeArticleGetStrings(loader)
{
  getCommonStrings((error, strings) =>
  {
    removeLoader(loader, () => {  });

    if(error != null)
    {
      removeBackground('removeArticleBackground');

      return displayError(erro.message, erro.detail, 'removeArticleError');
    }

    commonAppStrings = strings;

    return removeArticleOpenConfirmation();
  });
}

/****************************************************************************************************/

function removeArticleOpenConfirmation()
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'removeArticlePopup');

  popup       .setAttribute('class', 'standardPopup');
  buttons     .setAttribute('class', 'standardPopupButtons');
  confirm     .setAttribute('class', 'standardPopupButtonsConfirm');
  cancel      .setAttribute('class', 'standardPopupButtonsCancel');

  popup       .innerHTML += `<div class="standardPopupTitle">${commonAppStrings.root.news.removeArticlePopup.title}</div>`;
  popup       .innerHTML += `<div class="standardPopupMessage">${commonAppStrings.root.news.removeArticlePopup.message}</div>`;

  confirm     .innerText = commonAppStrings.root.news.removeArticlePopup.confirm;
  cancel      .innerText = commonAppStrings.root.news.removeArticlePopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    popup.remove();
    removeArticleSendToServer();
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('removeArticleBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function removeArticleSendToServer()
{
  displayLoader(commonAppStrings.root.news.removeArticlePopup.loader, (loader) =>
  {
    const articleUuid = document.getElementById('mainNewsBlockArticle').getAttribute('name');

    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { articleUuid: articleUuid }, url: '/queries/root/news/remove-article',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('removeArticleBackground');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'removeArticleError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'removeArticleError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('removeArticleBackground');

      displaySuccess(result.message, null, 'removeArticleSuccess');
    });
  });
}

/****************************************************************************************************/