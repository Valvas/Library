/****************************************************************************************************/

let addProlongationXhr = null;

/****************************************************************************************************/

function addProlongationOpenPopup(currentStoppageUuid, currentStoppageEndDate)
{
  if(document.getElementById('veilBackground')) return;

  currentStoppageEndDate = `${currentStoppageEndDate.split('/')[2]}-${currentStoppageEndDate.split('/')[1]}-${currentStoppageEndDate.split('/')[0]}`;

  const veil                    = document.createElement('div');
  const wrapper                 = document.createElement('div');
  const container               = document.createElement('div');
  const popup                   = document.createElement('div');
  const popupForm               = document.createElement('form');
  const popupFormEnd            = document.createElement('div');
  const popupFormAttachment     = document.createElement('div');
  const popupFormButtons        = document.createElement('div');
  const popupFormButtonsSubmit  = document.createElement('button');
  const popupFormButtonsCancel  = document.createElement('button');

  veil                    .setAttribute('id', 'veilBackground');
  wrapper                 .setAttribute('id', 'modalBackground');

  veil                    .setAttribute('class', 'veilBackground');
  wrapper                 .setAttribute('class', 'modalBackgroundVertical');
  container               .setAttribute('class', 'modalBackgroundHorizontal');
  popup                   .setAttribute('class', 'baseModal');
  popupForm               .setAttribute('class', 'addProlongationForm');
  popupFormEnd            .setAttribute('class', 'addProlongationFormField');
  popupFormAttachment     .setAttribute('class', 'addProlongationFormField');
  popupFormButtons        .setAttribute('class', 'addProlongationFormButtons');
  popupFormButtonsSubmit  .setAttribute('class', 'addProlongationFormButtonsConfirm');
  popupFormButtonsCancel  .setAttribute('class', 'addProlongationFormButtonsCancel');

  popup                   .innerHTML += `<div class="baseModalHeader"><div class="baseModalHeaderTitle">${appStrings.stoppageDetail.addProlongation.title}</div></div>`;

  popupFormEnd            .innerHTML += `<div id="addProlongationEndDateError" class="addProlongationFormFieldError">${appStrings.stoppageDetail.addProlongation.formErrors.cannotEndBeforeStartDate}</div>`;
  popupFormEnd            .innerHTML += `<label>${appStrings.stoppageDetail.addProlongation.endDateLabel} :</label>`;
  popupFormEnd            .innerHTML += `<input name="end" type="date" placeholder="${appStrings.stoppageDetail.addProlongation.endDateLabel}" required>`;

  popupFormAttachment     .innerHTML += `<div id="addProlongationAttachmentError" class="addProlongationFormFieldError">${appStrings.stoppageDetail.addProlongation.formErrors.attachmentMustBePdf}</div>`;
  popupFormAttachment     .innerHTML += `<label>${appStrings.stoppageDetail.addProlongation.attachmentLabel} :</label>`;
  popupFormAttachment     .innerHTML += `<input name="attachment" type="file" accept=".pdf" required>`;

  popupFormButtonsSubmit  .innerText = appStrings.stoppageDetail.addProlongation.submitButton;
  popupFormButtonsCancel  .innerText = appStrings.stoppageDetail.addProlongation.cancelButton;

  popupForm               .addEventListener('submit', () =>
  {
    event.preventDefault();
    addProlongationSendForm(currentStoppageUuid, currentStoppageEndDate);
  });

  popupFormButtonsCancel  .addEventListener('click', () =>
  {
    event.preventDefault();
    veil.remove();
    wrapper.remove();
  });

  popupFormButtons        .appendChild(popupFormButtonsSubmit);
  popupFormButtons        .appendChild(popupFormButtonsCancel);
  popupForm               .appendChild(popupFormEnd);
  popupForm               .appendChild(popupFormAttachment);
  popupForm               .appendChild(popupFormButtons);
  popup                   .appendChild(popupForm);
  container               .appendChild(popup);
  wrapper                 .appendChild(container);

  document.body.appendChild(veil);
  document.body.appendChild(wrapper);
}

/****************************************************************************************************/

function addProlongationSendForm(currentStoppageUuid, currentStoppageEndDate)
{
  event.preventDefault();

  if(addProlongationXhr !== null) return;

  checkMessageTag('addProlongationError');

  document.getElementById('addProlongationEndDateError').removeAttribute('style');
  document.getElementById('addProlongationAttachmentError').removeAttribute('style');

  if(event.target.elements['end'].value.length === 0) return;
  if(event.target.elements['attachment'].files[0] === undefined) return;

  const currentEndDate  = new Date(currentStoppageEndDate);
  const endDate         = new Date(event.target.elements['end'].value);
  const attachment      = event.target.elements['attachment'].files[0];

  /**************************************************/

  if(endDate < currentStoppageEndDate)
  {
    return document.getElementById('addProlongationEndDateError').style.display = 'block';
  }

  if(event.target.elements['attachment'].value.split('.')[event.target.elements['attachment'].value.split('.').length - 1].toLowerCase() !== 'pdf')
  {
    return document.getElementById('addProlongationAttachmentError').style.display = 'block';
  }

  document.getElementById('modalBackground').style.display = 'none';

  /**************************************************/

  displayLoader(appStrings.stoppageDetail.addProlongation.loaderMessage, (loader) =>
  {
    addProlongationXhr = new XMLHttpRequest();

    const data  = new FormData();

    addProlongationXhr.responseType = 'json';
    addProlongationXhr.timeout = 10000;

    data.append('stoppageUuid', currentStoppageUuid);
    data.append('endDate', Date.parse(endDate));
    data.append('attachmentFile', attachment);

    addProlongationXhr.open('POST', '/queries/stoppage/add-stoppage-prolongation', true);

    addProlongationXhr.send(data);

    addProlongationXhr.ontimeout = () =>
    {
      addProlongationXhr = null;

      removeLoader(loader, () =>
      {
        document.getElementById('modalBackground').removeAttribute('style');

        return displayError(commonStrings.global.xhrErrors.timeout, null, 'addProlongationError');
      });
    }

    addProlongationXhr.onload = () =>
    {
      removeLoader(loader, () =>
      {
        if(addProlongationXhr.status === 201)
        {
          document.getElementById('veilBackground').remove();
          document.getElementById('modalBackground').remove();

          displaySuccess(addProlongationXhr.response.message, 'addProlongationSuccess');

          addProlongationXhr = null;
        }

        else
        {
          document.getElementById('modalBackground').removeAttribute('style');

          displayError(addProlongationXhr.response.message, addProlongationXhr.response.detail, 'addProlongationError');

          addProlongationXhr = null;
        }
      });
    }
  });
}

/****************************************************************************************************/
