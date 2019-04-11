/****************************************************************************************************/
/****************************************************************************************************/

function createStoppageCheckAttachments()
{
  let amountOfAttachments = document.getElementById('stoppageAttachments').getElementsByClassName('addStoppageFormAttachmentSubmitted').length;

  if(amountOfAttachments === 0)
  {
    document.getElementById('attachmentsEmpty').removeAttribute('style');
  }
}

/****************************************************************************************************/
/****************************************************************************************************/

function createStoppageAddAttachment()
{
  event.preventDefault();

  if(document.getElementById('addingAttachment')) return;

  document.getElementById('attachmentsEmpty').style.display = 'none';

  const attachmentBlock         = document.createElement('div');
  const attachmentTypeBlock     = document.createElement('div');
  const attachmentTypeLabel     = document.createElement('div');
  const attachmentTypeInput     = document.createElement('select');
  const attachmentFileBlock     = document.createElement('div');
  const attachmentFileLabel     = document.createElement('div');
  const attachmentFileInput     = document.createElement('input');
  const attachmentCommentBlock  = document.createElement('div');
  const attachmentCommentLabel  = document.createElement('div');
  const attachmentCommentInput  = document.createElement('textarea');
  const attachmentButtons       = document.createElement('div');
  const attachmentSubmit        = document.createElement('button');
  const attachmentCancel        = document.createElement('button');

  for(let type in appStrings.addStoppage.correspondences)
  {
    attachmentTypeInput     .innerHTML += `<option value="${type}">${appStrings.addStoppage.correspondences[type]}</option>`;
  }

  attachmentBlock           .setAttribute('id', 'addingAttachment');

  attachmentFileInput       .setAttribute('type', 'file');
  attachmentFileInput       .setAttribute('accept', '.pdf');

  attachmentBlock           .setAttribute('class', 'addStoppageFormAttachment');
  attachmentTypeBlock       .setAttribute('class', 'addStoppageFormAttachmentBlock');
  attachmentFileBlock       .setAttribute('class', 'addStoppageFormAttachmentBlock');
  attachmentCommentBlock    .setAttribute('class', 'addStoppageFormAttachmentBlock');
  attachmentTypeLabel       .setAttribute('class', 'addStoppageFormAttachmentBlockLabel');
  attachmentFileLabel       .setAttribute('class', 'addStoppageFormAttachmentBlockLabel');
  attachmentCommentLabel    .setAttribute('class', 'addStoppageFormAttachmentBlockLabel');
  attachmentButtons         .setAttribute('class', 'addStoppageFormAttachmentButtons');
  attachmentSubmit          .setAttribute('class', 'addStoppageFormAttachmentButtonsSubmitDisabled');
  attachmentCancel          .setAttribute('class', 'addStoppageFormAttachmentButtonsCancel');

  attachmentTypeLabel       .innerText = appStrings.addStoppage.formFields.attachmentType;
  attachmentFileLabel       .innerText = appStrings.addStoppage.formFields.attachmentFile;
  attachmentCommentLabel    .innerText = appStrings.addStoppage.formFields.attachmentComment;
  attachmentSubmit          .innerText = appStrings.addStoppage.formFields.submitAtatchment;
  attachmentCancel          .innerText = appStrings.addStoppage.formFields.cancelAttachment;

  attachmentTypeBlock       .appendChild(attachmentTypeLabel);
  attachmentTypeBlock       .appendChild(attachmentTypeInput);

  attachmentFileBlock       .appendChild(attachmentFileLabel);
  attachmentFileBlock       .appendChild(attachmentFileInput);

  attachmentCommentBlock    .appendChild(attachmentCommentLabel);
  attachmentCommentBlock    .appendChild(attachmentCommentInput);

  attachmentButtons         .appendChild(attachmentSubmit);
  attachmentButtons         .appendChild(attachmentCancel);

  attachmentBlock           .appendChild(attachmentTypeBlock);
  attachmentBlock           .appendChild(attachmentFileBlock);
  attachmentBlock           .appendChild(attachmentCommentBlock);
  attachmentBlock           .appendChild(attachmentButtons);

  attachmentFileInput       .addEventListener('change', () =>
  {
    attachmentFileInput.value.length === 0
    ? attachmentSubmit.setAttribute('class', 'addStoppageFormAttachmentButtonsSubmitDisabled')
    : attachmentSubmit.setAttribute('class', 'addStoppageFormAttachmentButtonsSubmit');
  });

  attachmentSubmit          .addEventListener('click', () =>
  {
    event.preventDefault();

    if(attachmentFileInput.value.length === 0) return;

    const submittedBlock            = document.createElement('div');
    const submittedBlockType        = document.createElement('div');
    const submittedBlockFile        = document.createElement('div');
    const submittedBlockComment     = document.createElement('div');
    const submittedBlockFileName    = document.createElement('div');
    const submittedBlockFileRemove  = document.createElement('button');

    submittedBlock            .setAttribute('class', 'addStoppageFormAttachmentSubmitted');
    submittedBlockType        .setAttribute('class', 'addStoppageFormAttachmentSubmittedType');
    submittedBlockFile        .setAttribute('class', 'addStoppageFormAttachmentSubmittedFile');
    submittedBlockComment     .setAttribute('class', 'addStoppageFormAttachmentSubmittedComment');
    submittedBlockFileName    .setAttribute('class', 'addStoppageFormAttachmentSubmittedFileName');
    submittedBlockFileRemove  .setAttribute('class', 'addStoppageFormAttachmentSubmittedFileRemove');

    submittedBlock            .setAttribute('name', attachmentTypeInput.options[attachmentTypeInput.selectedIndex].value);

    submittedBlockType        .innerText = attachmentTypeInput.options[attachmentTypeInput.selectedIndex].innerText;
    submittedBlockFileName    .innerText = attachmentFileInput.value.split('\\')[attachmentFileInput.value.split('\\').length - 1];
    submittedBlockComment     .innerText = attachmentCommentInput.value.trim();
    submittedBlockFileRemove  .innerText = appStrings.addStoppage.formFields.removeAttachment;

    submittedBlockFile        .appendChild(submittedBlockFileName);
    submittedBlockFile        .appendChild(submittedBlockFileRemove);
    submittedBlock            .appendChild(submittedBlockType);
    submittedBlock            .appendChild(submittedBlockFile);
    submittedBlock            .appendChild(submittedBlockComment);
    submittedBlock            .appendChild(attachmentFileInput);

    submittedBlockFileRemove  .addEventListener('click', () =>
    {
      event.preventDefault();
      submittedBlock.remove();
      createStoppageCheckAttachments();
    });

    attachmentBlock           .remove();

    attachmentFileInput       .style.display = 'none';

    document.getElementById('stoppageAttachments').insertBefore(submittedBlock, document.getElementById('stoppageAttachments').children[0]);
  });

  attachmentCancel          .addEventListener('click', () =>
  {
    attachmentBlock.remove();
    createStoppageCheckAttachments();
  });

  document.getElementById('stoppageAttachments').insertBefore(attachmentBlock, document.getElementById('stoppageAttachments').children[0]);
}

/****************************************************************************************************/
/****************************************************************************************************/

function createStoppageCheckForm(event)
{
  event.preventDefault();

  document.getElementById('formError').removeAttribute('style');

  const employeeIdentifier    = event.target.elements['identifier'].value.trim();
  const employeeLastname      = event.target.elements['lastname'].value.trim();
  const employeeFirstname     = event.target.elements['firstname'].value.trim();
  const employeeGender        = event.target.elements['gender'].options[event.target.elements['gender'].selectedIndex].value;
  const employeeEstablishment = event.target.elements['establishment'].options[event.target.elements['establishment'].selectedIndex].value;
  const incidentType          = event.target.elements['type'].options[event.target.elements['type'].selectedIndex].value;
  const incidentStartDate     = event.target.elements['start'].value;
  const incidentSentDate      = event.target.elements['sent'].value;
  const incidentEndDate       = event.target.elements['end'].value;

  const startDate = new Date(incidentStartDate);
  const sentDate  = new Date(incidentSentDate);
  const endDate   = new Date(incidentEndDate);

  /**************************************************/

  const errorMessages = event.target.getElementsByClassName('addStoppageFormFieldError');

  for(let x = 0; x < errorMessages.length; x++)
  {
    errorMessages[x].removeAttribute('style');
  }

  /**************************************************/

  if(employeeIdentifier.length === 0)
  {
    event.target.elements['identifier'].value = '';
    return document.getElementById('identifierError').style.display = 'block';
  }

  if(employeeLastname.length === 0)
  {
    event.target.elements['lastname'].value = '';
    return document.getElementById('lastnameError').style.display = 'block';
  }

  if(employeeFirstname.length === 0)
  {
    event.target.elements['firstname'].value = '';
    return document.getElementById('firstnameError').style.display = 'block';
  }

  if(incidentStartDate.length === 0)
  {
    event.target.elements['start'].value = '';
    return document.getElementById('startError').style.display = 'block';
  }

  if(incidentSentDate.length === 0)
  {
    event.target.elements['sent'].value = '';
    return document.getElementById('sentError').style.display = 'block';
  }

  if(incidentEndDate.length === 0)
  {
    event.target.elements['end'].value = '';
    return document.getElementById('endError').style.display = 'block';
  }

  /**************************************************/

  if(startDate > sentDate)
  {
    event.target.elements['sent'].value = '';
    return document.getElementById('sentError').style.display = 'block';
  }

  if(startDate > endDate)
  {
    event.target.elements['end'].value = '';
    return document.getElementById('endError').style.display = 'block';
  }

  /**************************************************/

  const currentAttachments = document.getElementById('stoppageAttachments').getElementsByClassName('addStoppageFormAttachmentSubmitted');

  if(currentAttachments.length === 0)
  {
    document.getElementById('attachmentsEmpty').style.display = 'none';
    return document.getElementById('attachmentsError').style.display = 'block';
  }

  let amountOfInitialAttachment = 0;

  for(let x = 0; x < currentAttachments.length; x++)
  {
    if(currentAttachments[x].getAttribute('name') === 'started')
    {
      amountOfInitialAttachment += 1;
    }
  }

  if(amountOfInitialAttachment === 0)
  {
    document.getElementById('formError').innerText = appStrings.addStoppage.formErrors.initialRequired;
    return document.getElementById('formError').style.display = 'block';
  }

  if(amountOfInitialAttachment > 1)
  {
    document.getElementById('formError').innerText = appStrings.addStoppage.formErrors.initialOverflow;
    return document.getElementById('formError').style.display = 'block';
  }

  /**************************************************/

  const xhr   = new XMLHttpRequest();
  const data  = new FormData();

  xhr.responseType = 'json';

  data.append('registrationNumber', employeeIdentifier);
  data.append('employeeFirstname', employeeFirstname);
  data.append('employeeLastname', employeeLastname);
  data.append('employeeIsMale', employeeGender === 1);
  data.append('establishment', employeeEstablishment);
  data.append('incidentType', incidentType);
  data.append('startDate', Date.parse(startDate));
  data.append('sentDate', Date.parse(sentDate));
  data.append('endDate', Date.parse(endDate));

  const attachmentsData = {};

  for(let x = 0; x < currentAttachments.length; x++)
  {
    attachmentsData[x] =
    {
      correspondence: currentAttachments[x].getAttribute('name'),
      comment: currentAttachments[x].getElementsByClassName('addStoppageFormAttachmentSubmittedComment')[0].innerText
    };

    data.append(`file${x}`, currentAttachments[x].getElementsByTagName('input')[0].files[0]);
  }

  data.append('attachmentsData', JSON.stringify(attachmentsData));

  xhr.open('POST', '/queries/stoppage/create-stoppage', true);

  xhr.send(data);

  xhr.ontimeout = () =>
  {

  }

  xhr.onload = () =>
  {
    if(xhr.status === 201)
    {
      console.log(xhr.response.message);
    }

    else
    {
      console.log(xhr.response.message);
    }
  }
}

/****************************************************************************************************/
/****************************************************************************************************/
