/****************************************************************************************************/

function postReportCommentOpenPrompt()
{
  if(document.getElementById('veilBackground')) return;

  const reportComment = document.getElementById('reportComment').value.trim();

  if(reportComment.length === 0) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  const veilBackground        = document.createElement('div');
  const verticalBackground    = document.createElement('div');
  const horizontalBackground  = document.createElement('div');
  const modal                 = document.createElement('div');
  const modalHeader           = document.createElement('div');
  const modalHeaderTitle      = document.createElement('div');
  const modalContent          = document.createElement('div');
  const modalContentButtons   = document.createElement('div');
  const modalContentConfirm   = document.createElement('button');
  const modalContentCancel    = document.createElement('button');

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

  modalHeaderTitle      .innerText = commonStrings.root.bugs.detail.commentConfirmationTitle;
  modalContentConfirm   .innerText = commonStrings.root.bugs.detail.commentConfirmationSubmit;
  modalContentCancel    .innerText = commonStrings.global.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${commonStrings.root.bugs.detail.commentConfirmationMessage}</div>`;

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
    modal.remove();
    postReportCommentSendToServer(reportComment);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    checkMessageTag('postBugReportCommentError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function postReportCommentSendToServer(reportComment)
{
  const reportUuid = document.getElementById('reportUuid').getAttribute('name');
  
  displayLoader(commonStrings.root.bugs.detail.commentConfirmationLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 10000, data: { reportUuid: reportUuid, reportComment: reportComment }, url: '/queries/root/bugs/post-comment',
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('mainContainer').removeAttribute('style');
          document.getElementById('modalBackground').remove();
          document.getElementById('veilBackground').remove();

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'postBugReportCommentError') :
          displayError(commonStrings.global.xhrErrors.timeout, null, 'postBugReportCommentError');
        });
      }

    }).done((result) =>
    {
      document.getElementById('reportComment').value = '';

      removeLoader(loader, () =>
      {
        document.getElementById('mainContainer').removeAttribute('style');
        document.getElementById('modalBackground').remove();
        document.getElementById('veilBackground').remove();

        displaySuccess(result.message, null, 'postBugReportCommentSuccess');
      });
    });
  });
}

/****************************************************************************************************/
