/****************************************************************************************************/

var toolbarOptions = [['bold', 'italic', 'underline'], [{ 'color': [] }], [{ 'list': 'ordered'}, { 'list': 'bullet' }]];

var editor = new Quill('#createArticleContainer', 
{
  modules: { toolbar: toolbarOptions },
  theme: 'snow'
});

document.getElementById('createArticleContainer').children[0].innerHTML = document.getElementById('originalContent').innerHTML;

/****************************************************************************************************/

if(document.getElementById('createArticleSendButton')) document.getElementById('createArticleSendButton').addEventListener('click', () => 
{
  checkArticleContent();
});

/****************************************************************************************************/

function checkArticleContent()
{
  if(document.getElementById('createArticleBlockTitleInput').value.length === 0) displayInfo('Article incomplet', 'Le titre de l\'article est manquant', null);

  else
  {
    if(document.getElementById('createArticleContainer').children[0].innerText.length < 128) displayInfo('Article incomplet', 'Veuillez ajouter du contenu à l\'article', null);

    else
    {
      displayConfirmationPopup();
    }
  }
}

/****************************************************************************************************/

function displayConfirmationPopup()
{
  if(document.getElementById('articleConfirmationPopup') == null)
  {
    var background    = document.createElement('div');
    var popup         = document.createElement('div');
    var popupTitle    = document.createElement('div');
    var popupMessage  = document.createElement('div');

    var popupConfirm  = document.createElement('button');
    var popupCancel   = document.createElement('button');

    background        .setAttribute('class', 'standardBackground');
    popup             .setAttribute('class', 'standardPopup');
    popupTitle        .setAttribute('class', 'standardPopupTitle');
    popupMessage      .setAttribute('class', 'standardPopupMessage');
    popupConfirm      .setAttribute('class', 'standardPopupConfirm');
    popupCancel       .setAttribute('class', 'standardPopupCancel');

    popup             .setAttribute('id', 'articleConfirmationPopup');

    popupTitle        .innerText = 'Créer un article';
    popupMessage      .innerText = 'Êtes-vous sûr(e) de vouloir modifier cet article ?';
    popupConfirm      .innerText = 'Oui';
    popupCancel       .innerText = 'Retour';

    popupCancel       .addEventListener('click', () =>
    {
      popup.remove();
      background.remove();
    });

    popupConfirm      .addEventListener('click', () =>
    {
      popup.remove();
      background.remove();

      sendNewArticle();
    })

    popup             .appendChild(popupTitle);
    popup             .appendChild(popupMessage);
    popup             .appendChild(popupConfirm);
    popup             .appendChild(popupCancel);

    document.body     .appendChild(background);
    document.body     .appendChild(popup);
  }
}

/****************************************************************************************************/

function sendNewArticle()
{
  displayLoader(`Enregistrement de l'article en cours`, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT',
      dataType: 'json',
      timeout: 5000,
      data: { articleTitle: document.getElementById('createArticleBlockTitleInput').value, articleContent: document.getElementById('createArticleContainer').children[0].innerHTML, articleUuid: document.getElementById('createArticleContainer').getAttribute('name') },
      url: '/queries/root/news/update-article',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        displaySuccess(result.message, null, null);
        document.getElementById('createArticleContainer').children[0].innerHTML = '';
        document.getElementById('createArticleBlockTitleInput').value = '';
      });
    });
  });
}

/****************************************************************************************************/