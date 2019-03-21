/****************************************************************************************************/
/* RETRIEVE FILE LOGS FROM SERVER */
/****************************************************************************************************/

function openFileDetail(fileUuid)
{
  if(document.getElementById('veilBackground')) return;

  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  /********************************************************************************/

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  const modalVeil       = document.createElement('div');
  const modalBackground = document.createElement('div');
  const modalContainer  = document.createElement('div');

  modalVeil         .setAttribute('id', 'modalVeil');
  modalBackground   .setAttribute('id', 'modalBackground');
  modalContainer    .setAttribute('id', 'modalContainer');

  modalBackground   .appendChild(modalContainer);
  document.body     .appendChild(modalBackground);
  document.body     .appendChild(modalVeil);

  /********************************************************************************/

  displayLoader(storageStrings.serviceSection.fileDetail.loaderMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', timeout: 10000, data: { fileUuid: fileUuid, serviceUuid: serviceUuid }, dataType: 'JSON', url: '/queries/storage/services/get-file-logs', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('mainContainer').removeAttribute('style');
          modalBackground.remove();
          modalVeil.remove();

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'fileMenuError') :
          displayError(commonStrings.global.xhrErrors.timeout, null, 'fileMenuError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        for(var right in result.accountRightsOnService)
        {
          result.accountRightsOnService[right] = result.accountRightsOnService[right] === 1 ? true : false;
        }

        if(result.isAppAdmin) result.accountRightsOnService.isAdmin = true;

        return openFileDetailCreateModal(result.fileData, result.fileLogs.reverse(), result.accountRightsOnService);
      });
    });
  });
}

/****************************************************************************************************/
/* CREATE MODAL WITH FILE LOGS */
/****************************************************************************************************/

function openFileDetailCreateModal(fileData, fileLogs, serviceRights)
{
  const modal               = document.createElement('div');
  const modalHeader         = document.createElement('div');
  const modalLogs           = document.createElement('div');
  const modalButtons        = document.createElement('div');
  const modalButtonsComment = document.createElement('button');
  const modalButtonsClose   = document.createElement('button');

  modal               .setAttribute('id', 'serviceFileDetail');

  modal               .setAttribute('name', fileData.uuid);

  modal               .setAttribute('class', 'serviceFileDetailModal');
  modalHeader         .setAttribute('class', 'serviceFileDetailModalHeader');
  modalLogs           .setAttribute('class', 'serviceFileDetailModalLogs');
  modalButtons        .setAttribute('class', 'serviceFileDetailModalButtons');
  modalButtonsClose   .setAttribute('class', 'serviceFileDetailModalButtonsClose');

  serviceRights.postComments || serviceRights.isAdmin
  ? modalButtonsComment.setAttribute('class', 'serviceFileDetailModalButtonsComment')
  : modalButtonsComment.setAttribute('class', 'serviceFileDetailModalButtonsCommentDisabled');

  if(serviceRights.postComments || serviceRights.isAdmin)
  {
    modalButtonsComment.addEventListener('click', fileDetailOpenCommentModal);
  }

  /********************************************************************************/

  for(var x = 0; x < fileLogs.length; x++)
  {
    modalLogs.innerHTML += fileLogs[x].type === 3
    ? `<div class="serviceFileDetailModalLogsElement"><div class="serviceFileDetailModalLogsElementDate">${fileLogs[x].date}</div><div class="serviceFileDetailModalLogsElementMessage">${fileLogs[x].message}</div><div class="serviceFileDetailModalLogsElementComment">${fileLogs[x].comment}</div></div>`
    : `<div class="serviceFileDetailModalLogsElement"><div class="serviceFileDetailModalLogsElementDate">${fileLogs[x].date}</div><div class="serviceFileDetailModalLogsElementMessage">${fileLogs[x].message}</div></div>`;
  }

  /********************************************************************************/

  modalHeader         .innerText = fileData.name;
  modalButtonsComment .innerText = storageStrings.serviceSection.fileDetail.commentButton;
  modalButtonsClose   .innerText = commonStrings.global.close;

  modalButtonsClose   .addEventListener('click', () =>
  {
    event.stopPropagation();
    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('modalBackground').remove();
    document.getElementById('modalVeil').remove();
  });

  modalButtons        .appendChild(modalButtonsComment);
  modalButtons        .appendChild(modalButtonsClose);
  modal               .appendChild(modalHeader);
  modal               .appendChild(modalLogs);
  modal               .appendChild(modalButtons);

  document.getElementById('modalContainer').appendChild(modal);
}

/****************************************************************************************************/
/* ADD COMMENT ON FILE */
/****************************************************************************************************/

function fileDetailOpenCommentModal()
{
  if(document.getElementById('serviceFileDetail') == null) return;

  const fileUuid = document.getElementById('serviceFileDetail').getAttribute('name');

  document.getElementById('serviceFileDetail').style.display = 'none';

  /********************************************************************************/

  const modal                   = document.createElement('div');
  const modalHeader             = document.createElement('div');
  const modalForm               = document.createElement('form');
  const modalFormError          = document.createElement('div');
  const modalFormInput          = document.createElement('textarea');
  const modalFormButtons        = document.createElement('div');
  const modalFormButtonsSubmit  = document.createElement('button');
  const modalFormButtonsCancel  = document.createElement('button');

  modal                   .setAttribute('id', 'serviceFileComment');

  modal                   .setAttribute('class', 'serviceFileCommentModal');
  modalHeader             .setAttribute('class', 'serviceFileCommentModalHeader');
  modalForm               .setAttribute('class', 'serviceFileCommentModalForm');
  modalFormError          .setAttribute('class', 'serviceFileCommentModalFormError');
  modalFormButtons        .setAttribute('class', 'serviceFileCommentModalFormButtons');
  modalFormButtonsSubmit  .setAttribute('class', 'serviceFileCommentModalFormButtonsSubmit');
  modalFormButtonsCancel  .setAttribute('class', 'serviceFileCommentModalFormButtonsCancel');

  modalFormInput          .setAttribute('name', 'comment');

  modalHeader             .innerText = storageStrings.serviceSection.fileDetail.commentModal.header;
  modalFormButtonsSubmit  .innerText = storageStrings.serviceSection.fileDetail.commentModal.submit;
  modalFormButtonsCancel  .innerText = commonStrings.global.cancel;

  modalForm               .addEventListener('submit', fileDetailSendCommentToServer);

  modalFormButtonsCancel  .addEventListener('click', () =>
  {
    event.preventDefault();
    event.stopPropagation();

    modal.remove();
    document.getElementById('serviceFileDetail').removeAttribute('style');
  });

  modalFormButtons  .appendChild(modalFormButtonsSubmit);
  modalFormButtons  .appendChild(modalFormButtonsCancel);

  modalForm         .appendChild(modalFormError);
  modalForm         .appendChild(modalFormInput);
  modalForm         .appendChild(modalFormButtons);

  modal             .appendChild(modalHeader);
  modal             .appendChild(modalForm);

  document.getElementById('modalContainer').appendChild(modal);
}

/****************************************************************************************************/
/* CHECK COMMENT FORMAT BEFORE SENDING IT TO SERVER */
/****************************************************************************************************/

function fileDetailSendCommentToServer(event)
{
  event.preventDefault();
  event.stopPropagation();

  event.target.getElementsByClassName('serviceFileCommentModalFormError')[0].removeAttribute('style');

  const comment = event.target.elements['comment'].value.trim();

  if(comment.length === 0)
  {
    event.target.getElementsByClassName('serviceFileCommentModalFormError')[0].innerText = storageStrings.serviceSection.fileDetail.commentModal.emptyError;
    event.target.getElementsByClassName('serviceFileCommentModalFormError')[0].style.display = 'block';
  }

  else
  {
    document.getElementById('serviceFileComment').style.display = 'none';

    displayLoader(storageStrings.serviceSection.fileDetail.commentModal.loaderMessage, (loader) =>
    {
      $.ajax(
      {
        method: 'POST', timeout: 10000, data: { fileUuid: document.getElementById('serviceFileDetail').getAttribute('name'), fileComment: comment }, dataType: 'JSON', url: '/queries/storage/services/post-file-comment', success: () => {},
        error: (xhr, status, error) =>
        {
          removeLoader(loader, () =>
          {
            document.getElementById('serviceFileComment').removeAttribute('style');

            xhr.responseJSON != undefined ?
            displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'fileCommentError') :
            displayError(commonStrings.global.xhrErrors.timeout, null, 'fileCommentError');
          });
        }

      }).done((result) =>
      {
        document.getElementById('serviceFileComment').remove();

        removeLoader(loader, () =>
        {
          document.getElementById('serviceFileDetail').removeAttribute('style');

          return displaySuccess(result.message, null, 'fileCommentSuccess');
        });
      });
    });
  }
}

/****************************************************************************************************/
