/****************************************************************************************************/

function loadStoppageSection()
{
  displayLocationLoader();

  switch(currentLocation)
  {
    case 'list':

      history.pushState(null, null, '/stoppage/list');

      loadStoppagesList();

    break;

    case 'add':

      history.pushState(null, null, '/stoppage/add');

      loadStoppageForm();

    break;

    case 'detail':

      history.pushState(null, null, `/stoppage/detail/${urlParameters[0]}`);

      loadStoppageDetail(urlParameters[0]);

    break;

    default:

      history.pushState(null, null, '/stoppage/list');

      loadStoppagesList();

    break;
  }
}

/****************************************************************************************************/

function loadStoppagesList()
{
  $.ajax(
  {
    method: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/stoppage/get-stoppages-list', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON !== undefined
      ? displayLocationError(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayLocationError();
    }

  }).done((result) =>
  {
    const stoppagesList = result.stoppagesList;

    const mainContainer           = document.createElement('div');
    const addContainer            = document.createElement('div');
    const addStoppageButton       = document.createElement('button');
    const emptyListMessage        = document.createElement('div');
    const stoppagesListContainer  = document.createElement('div');

    mainContainer           .setAttribute('class', 'listMainContainer');
    addContainer            .setAttribute('class', 'listMainContainerAdd');
    emptyListMessage        .setAttribute('class', 'listMainContainerEmpty');
    stoppagesListContainer  .setAttribute('class', 'listMainContainerList');

    addStoppageButton       .innerText = appStrings.stoppageslist.addStoppageButton;
    emptyListMessage        .innerText = appStrings.stoppageslist.emptyList;

    addContainer            .appendChild(addStoppageButton);

    mainContainer           .appendChild(addContainer);
    mainContainer           .appendChild(emptyListMessage);
    mainContainer           .appendChild(stoppagesListContainer);

    addStoppageButton       .addEventListener('click', () =>
    {
      urlParameters = [];
      currentLocation = 'add';
      loadLocation(currentLocation);
    });

    if(stoppagesList.length === 0)
    {
      emptyListMessage      .style.display = 'block';
    }

    for(let x = 0; x < stoppagesList.length; x++)
    {
      const currentStoppage                     = document.createElement('div');
      const currentStoppageHeader               = document.createElement('div');
      const currentStoppageHeaderData           = document.createElement('div');
      const currentStoppageHeaderDataNumber     = document.createElement('div');
      const currentStoppageHeaderDataLastname   = document.createElement('div');
      const currentStoppageHeaderDataFirstname  = document.createElement('div');
      const currentStoppageHeaderNumber         = document.createElement('div');
      const currentStoppageHeaderDates          = document.createElement('div');
      const currentStoppageHeaderDatesStart     = document.createElement('div');
      const currentStoppageHeaderDatesEnd       = document.createElement('div');
      const currentStoppageAccess               = document.createElement('div');
      const currentStoppageAccessButton         = document.createElement('button');

      currentStoppage                     .setAttribute('class', 'listStoppage');
      currentStoppageHeader               .setAttribute('class', 'listStoppageHeader');
      currentStoppageHeaderData           .setAttribute('class', 'listStoppageHeaderData');
      currentStoppageHeaderDataNumber     .setAttribute('class', 'listStoppageHeaderDataElement');
      currentStoppageHeaderDataLastname   .setAttribute('class', 'listStoppageHeaderDataElement');
      currentStoppageHeaderDataFirstname  .setAttribute('class', 'listStoppageHeaderDataElement');
      currentStoppageHeaderDates          .setAttribute('class', 'listStoppageHeaderDates');
      currentStoppageHeaderDatesStart     .setAttribute('class', 'listStoppageHeaderDatesElement');
      currentStoppageHeaderDatesEnd       .setAttribute('class', 'listStoppageHeaderDatesElement');
      currentStoppageAccess               .setAttribute('class', 'listStoppageAccess');

      currentStoppageHeaderDataNumber     .innerHTML += `<div class="listStoppageHeaderDataElementKey">${appStrings.stoppageslist.registrationNumberKey} :</div>`;
      currentStoppageHeaderDataNumber     .innerHTML += `<div class="listStoppageHeaderDataElementValue">${stoppagesList[x].registrationNumber}</div>`;
      currentStoppageHeaderDataLastname   .innerHTML += `<div class="listStoppageHeaderDataElementKey">${appStrings.stoppageslist.employeeLastname} :</div>`;
      currentStoppageHeaderDataLastname   .innerHTML += `<div class="listStoppageHeaderDataElementValue">${stoppagesList[x].employeeLastname.charAt(0).toUpperCase()}${stoppagesList[x].employeeLastname.slice(1)}</div>`;
      currentStoppageHeaderDataFirstname  .innerHTML += `<div class="listStoppageHeaderDataElementKey">${appStrings.stoppageslist.employeeFirstname} :</div>`;
      currentStoppageHeaderDataFirstname  .innerHTML += `<div class="listStoppageHeaderDataElementValue">${stoppagesList[x].employeeFirstname.charAt(0).toUpperCase()}${stoppagesList[x].employeeFirstname.slice(1)}</div>`;
      currentStoppageHeaderDatesStart     .innerHTML += `<div class="listStoppageHeaderDatesElementKey">${appStrings.stoppageslist.startDateKey} :</div>`;
      currentStoppageHeaderDatesStart     .innerHTML += `<div class="listStoppageHeaderDatesElementValue">${stoppagesList[x].startDate}</div>`;
      currentStoppageHeaderDatesEnd       .innerHTML += `<div class="listStoppageHeaderDatesElementKey">${appStrings.stoppageslist.endDateKey} :</div>`;
      currentStoppageHeaderDatesEnd       .innerHTML += `<div class="listStoppageHeaderDatesElementValue">${stoppagesList[x].endDate}</div>`;

      currentStoppageAccessButton         .innerText = appStrings.stoppageslist.accessStoppage;

      currentStoppageAccessButton         .addEventListener('click', () =>
      {
        urlParameters = [ stoppagesList[x].uuid ];
        currentLocation = 'detail';
        loadLocation(currentLocation);
      });

      currentStoppageHeader               .appendChild(currentStoppageHeaderData);
      currentStoppageHeaderData           .appendChild(currentStoppageHeaderDataNumber);
      currentStoppageHeaderData           .appendChild(currentStoppageHeaderDataLastname);
      currentStoppageHeaderData           .appendChild(currentStoppageHeaderDataFirstname);
      currentStoppageHeaderDates          .appendChild(currentStoppageHeaderDatesStart);
      currentStoppageHeaderDates          .appendChild(currentStoppageHeaderDatesEnd);
      currentStoppageHeader               .appendChild(currentStoppageHeaderDates);
      currentStoppageAccess               .appendChild(currentStoppageAccessButton);
      currentStoppage                     .appendChild(currentStoppageHeader);
      currentStoppage                     .appendChild(currentStoppageAccess);
      stoppagesListContainer              .appendChild(currentStoppage);
    }

    $(document.getElementById('locationWrapper')).fadeOut(250, () =>
    {
      document.getElementById('locationContainer').innerHTML = `<div class="locationContentTitle">${appStrings.stoppageslist.locationLabel}</div>`;

      document.getElementById('locationContainer').appendChild(mainContainer);

      $(document.getElementById('locationWrapper')).fadeIn(250);
    });
  });
}

/****************************************************************************************************/

function loadStoppageForm()
{
  $.ajax(
  {
    method: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/stoppage/get-establishments-list', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON !== undefined
      ? displayLocationError(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayLocationError();
    }

  }).done((result) =>
  {
    const establishmentsList = result.establishmentsList;

    const formContainer         = document.createElement('form');
    const formError             = document.createElement('div');
    const formIdentifier        = document.createElement('div');
    const formLastname          = document.createElement('div');
    const formFirstname         = document.createElement('div');
    const formGender            = document.createElement('div');
    const formGenderList        = document.createElement('select');
    const formEstablishment     = document.createElement('div');
    const formEstablishmentList = document.createElement('select');
    const formIncidentType      = document.createElement('div');
    const formIncidentTypeList  = document.createElement('select');
    const formStartDate         = document.createElement('div');
    const formSentDate          = document.createElement('div');
    const formEndDate           = document.createElement('div');
    const formAttachmentFile    = document.createElement('div');
    const formAttachmentComment = document.createElement('div');
    const formSubmit            = document.createElement('button');

    formIdentifier        .innerHTML += `<label>${appStrings.addStoppage.formFields.registrationNumber} :</label><input name="identifier" type="text" placeholder="${appStrings.addStoppage.formFields.registrationNumber}" required /><div id="identifierError" class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.emptyField}</div>`;
    formLastname          .innerHTML += `<label>${appStrings.addStoppage.formFields.lastname} :</label><input name="lastname" type="text" placeholder="${appStrings.addStoppage.formFields.lastname}" required /><div id="lastnameError" class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.emptyField}</div>`;
    formFirstname         .innerHTML += `<label>${appStrings.addStoppage.formFields.firstname} :</label><input name="firstname" type="text" placeholder="${appStrings.addStoppage.formFields.firstname}" required /><div id="firstnameError" class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.emptyField}</div>`;
    formGender            .innerHTML += `<label>${appStrings.addStoppage.formFields.gender} :</label>`;
    formEstablishment     .innerHTML += `<label>${appStrings.addStoppage.formFields.establishment} :</label>`;
    formIncidentType      .innerHTML += `<label>${appStrings.addStoppage.formFields.incidentType} :</label>`;
    formStartDate         .innerHTML += `<label>${appStrings.addStoppage.formFields.startDate} :</label><input name="start" type="date" required /><div class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.emptyField}</div>`;
    formSentDate          .innerHTML += `<label>${appStrings.addStoppage.formFields.communicationDate} :</label><input name="sent" type="date" required /><div class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.emptyField}</div><div id="sentError" class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.communicationDateBeforeStartDate}</div>`;
    formEndDate           .innerHTML += `<label>${appStrings.addStoppage.formFields.endDate} :</label><input name="end" type="date" required /><div class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.emptyField}</div><div id="endError" class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.endDateBeforeStartDate}</div>`;
    formAttachmentFile    .innerHTML += `<label>${appStrings.addStoppage.formFields.attachmentFile} :</label><input name="attachmentFile" type="file" required /><div id="attachmentError" class="addStoppageFormFieldError">${appStrings.addStoppage.formErrors.emptyField}</div>`;
    formAttachmentComment .innerHTML += `<label>${appStrings.addStoppage.formFields.attachmentComment} :</label><textarea name="attachmentComment" placeholder="${appStrings.addStoppage.formFields.attachmentComment}"></textarea>`;

    for(let option in appStrings.addStoppage.formFields.genders)
    {
      formGenderList.innerHTML += `<option value="${option}">${appStrings.addStoppage.formFields.genders[option]}</option>`;
    }

    for(let x = 0; x < establishmentsList.length; x++)
    {
      formEstablishmentList.innerHTML += `<option value="${establishmentsList[x].uuid}">${establishmentsList[x].name}</option>`;
    }

    for(let option in appStrings.addStoppage.formFields.incidentTypes)
    {
      formIncidentTypeList.innerHTML += `<option value="${option}">${appStrings.addStoppage.formFields.incidentTypes[option]}</option>`;
    }

    formSubmit            .innerText = appStrings.addStoppage.formFields.submitForm;

    formGenderList        .setAttribute('name', 'gender');
    formEstablishmentList .setAttribute('name', 'establishment');
    formIncidentTypeList  .setAttribute('name', 'type');

    formSubmit            .setAttribute('type', 'submit');

    formError             .setAttribute('id', 'formError');

    formContainer         .setAttribute('class', 'addStoppageForm');
    formError             .setAttribute('class', 'addStoppageFormError');
    formIdentifier        .setAttribute('class', 'addStoppageFormField');
    formLastname          .setAttribute('class', 'addStoppageFormField');
    formFirstname         .setAttribute('class', 'addStoppageFormField');
    formGender            .setAttribute('class', 'addStoppageFormField');
    formEstablishment     .setAttribute('class', 'addStoppageFormField');
    formIncidentType      .setAttribute('class', 'addStoppageFormField');
    formStartDate         .setAttribute('class', 'addStoppageFormField');
    formSentDate          .setAttribute('class', 'addStoppageFormField');
    formEndDate           .setAttribute('class', 'addStoppageFormField');
    formAttachmentFile    .setAttribute('class', 'addStoppageFormField');
    formAttachmentComment .setAttribute('class', 'addStoppageFormField');
    formSubmit            .setAttribute('class', 'addStoppageFormSubmit');

    formGender            .appendChild(formGenderList);
    formEstablishment     .appendChild(formEstablishmentList);
    formIncidentType      .appendChild(formIncidentTypeList);

    formContainer         .appendChild(formIdentifier);
    formContainer         .appendChild(formLastname);
    formContainer         .appendChild(formFirstname);
    formContainer         .appendChild(formGender);
    formContainer         .appendChild(formEstablishment);
    formContainer         .appendChild(formIncidentType);
    formContainer         .appendChild(formStartDate);
    formContainer         .appendChild(formSentDate);
    formContainer         .appendChild(formEndDate);
    formContainer         .appendChild(formAttachmentFile);
    formContainer         .appendChild(formAttachmentComment);
    formContainer         .appendChild(formError);
    formContainer         .appendChild(formSubmit);

    formContainer         .addEventListener('submit', createStoppageCheckForm);

    $(document.getElementById('locationWrapper')).fadeOut(250, () =>
    {
      document.getElementById('locationContainer').innerHTML = `<div class="locationContentTitle">${appStrings.addStoppage.locationLabel}</div>`;

      document.getElementById('locationContainer').appendChild(formContainer);

      $(document.getElementById('locationWrapper')).fadeIn(250);
    });
  });
}

/****************************************************************************************************/

function loadStoppageDetail(stoppageUuid)
{
  $.ajax(
  {
    method: 'POST', data: { stoppageUuid: stoppageUuid }, timeout: 10000, dataType: 'JSON', url: '/queries/stoppage/get-stoppage-detail', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON !== undefined
      ? displayLocationError(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayLocationError();
    }

  }).done((stoppageDetail) =>
  {
    document.getElementById('locationContainer').setAttribute('name', stoppageDetail.uuid);

    const detailWrapper         = document.createElement('div');
    const detailContainer       = document.createElement('div');
    const detailRegistration    = document.createElement('div');
    const detailLastname        = document.createElement('div');
    const detailFirstname       = document.createElement('div');
    const detailStartDate       = document.createElement('div');
    const detailReceivedDate    = document.createElement('div');
    const detailEndDate         = document.createElement('div');
    const detailInitial         = document.createElement('div');
    const detailInitialFile     = document.createElement('div');
    const detailInitialButton   = document.createElement('button');

    detailWrapper       .setAttribute('class', 'stoppageDetailWrapper');
    detailContainer     .setAttribute('class', 'stoppageDetailContainer');
    detailRegistration  .setAttribute('class', 'stoppageDetailContainerData');
    detailLastname      .setAttribute('class', 'stoppageDetailContainerData');
    detailFirstname     .setAttribute('class', 'stoppageDetailContainerData');
    detailStartDate     .setAttribute('class', 'stoppageDetailContainerData');
    detailReceivedDate  .setAttribute('class', 'stoppageDetailContainerData');
    detailEndDate       .setAttribute('class', 'stoppageDetailContainerData');
    detailInitial       .setAttribute('class', 'stoppageDetailContainerAttachment');
    detailInitialFile   .setAttribute('class', 'stoppageDetailContainerAttachmentFile');
    detailInitialButton .setAttribute('class', 'stoppageDetailContainerAttachmentDownload');

    detailRegistration  .innerHTML += `<div class="stoppageDetailContainerDataKey">${appStrings.stoppageDetail.dataLabels.registrationNumber} :</div>`;
    detailRegistration  .innerHTML += `<div class="stoppageDetailContainerDataValue">${stoppageDetail.registrationNumber}</div>`;

    detailLastname      .innerHTML += `<div class="stoppageDetailContainerDataKey">${appStrings.stoppageDetail.dataLabels.lastname} :</div>`;
    detailLastname      .innerHTML += `<div class="stoppageDetailContainerDataValue">${stoppageDetail.employeeLastname.charAt(0).toUpperCase()}${stoppageDetail.employeeLastname.slice(1)}</div>`;

    detailFirstname     .innerHTML += `<div class="stoppageDetailContainerDataKey">${appStrings.stoppageDetail.dataLabels.firstname} :</div>`;
    detailFirstname     .innerHTML += `<div class="stoppageDetailContainerDataValue">${stoppageDetail.employeeFirstname.charAt(0).toUpperCase()}${stoppageDetail.employeeFirstname.slice(1)}</div>`;

    detailStartDate     .innerHTML += `<div class="stoppageDetailContainerDataKey">${appStrings.stoppageDetail.dataLabels.startDate} :</div>`;
    detailStartDate     .innerHTML += `<div class="stoppageDetailContainerDataValue">${stoppageDetail.startDate}</div>`;

    detailReceivedDate  .innerHTML += `<div class="stoppageDetailContainerDataKey">${appStrings.stoppageDetail.dataLabels.receivedDate} :</div>`;
    detailReceivedDate  .innerHTML += `<div class="stoppageDetailContainerDataValue">${stoppageDetail.sentDate}</div>`;

    detailEndDate       .innerHTML += `<div class="stoppageDetailContainerDataKey">${appStrings.stoppageDetail.dataLabels.endDate} :</div>`;

    detailEndDate       .innerHTML += stoppageDetail.prolongations.length > 0
    ? `<div id="stoppageEndDate" class="stoppageDetailContainerDataValue">${stoppageDetail.prolongations[stoppageDetail.prolongations.length - 1].endDate}</div>`
    : `<div id="stoppageEndDate" class="stoppageDetailContainerDataValue">${stoppageDetail.endDate}</div>`;

    detailInitial       .innerHTML += `<div class="stoppageDetailContainerAttachmentLabel">${appStrings.addStoppage.correspondences.started}</div>`;
    detailInitial       .innerHTML += stoppageDetail.attachments.initial.comment.length === 0
    ? `<div id="stoppageEndDate" class="stoppageDetailContainerAttachmentComment">${appStrings.stoppageDetail.emptyAttachmentComment}</div>`
    : `<div id="stoppageEndDate" class="stoppageDetailContainerAttachmentComment">${stoppageDetail.attachments.initial.comment}</div>`;

    detailInitialFile   .innerText = `${stoppageDetail.attachments.initial.name}.pdf`;
    detailInitialButton .innerText = appStrings.stoppageDetail.downloadAttachment;

    detailInitialFile   .addEventListener('click', () =>
    {
      window.open(`/queries/stoppage/visualize-attachment/${stoppageDetail.uuid}/${stoppageDetail.attachments.initial.uuid}`);
    });

    detailInitialButton .addEventListener('click', () =>
    {
      window.open(`/queries/stoppage/download-attachment/${stoppageDetail.uuid}/${stoppageDetail.attachments.initial.uuid}/${stoppageDetail.attachments.initial.name}`);
    });

    detailInitial       .insertBefore(detailInitialFile, detailInitial.children[1]);
    detailInitial       .appendChild(detailInitialButton);

    detailContainer     .appendChild(detailRegistration);
    detailContainer     .appendChild(detailLastname);
    detailContainer     .appendChild(detailFirstname);
    detailContainer     .appendChild(detailStartDate);
    detailContainer     .appendChild(detailReceivedDate);
    detailContainer     .appendChild(detailEndDate);
    detailContainer     .appendChild(detailInitial);

    loadStoppageDetailBuildProlongationsBlock(detailContainer, stoppageDetail);
    loadStoppageDetailBuildEventsSection(detailContainer, stoppageDetail);
    loadStoppageDetailBuildActionsSection(detailContainer, stoppageDetail.attachments.events.length === 0 ? null : stoppageDetail.attachments.events[stoppageDetail.attachments.events.length - 1].type);

    detailWrapper       .appendChild(detailContainer);

    $(document.getElementById('locationWrapper')).fadeOut(250, () =>
    {
      document.getElementById('locationContainer').innerHTML = `<div class="locationContentTitle">${appStrings.stoppageDetail.locationLabel}</div>`;

      document.getElementById('locationContainer').appendChild(detailWrapper);

      $(document.getElementById('locationWrapper')).fadeIn(250);
    });
  });
}

/****************************************************************************************************/

function loadStoppageDetailBuildEventsSection(detailContainer, stoppageDetail)
{
  const eventsBlock       = document.createElement('div');
  const eventsBlockHeader = document.createElement('div');

  eventsBlock         .setAttribute('class', 'stoppageDetailEvents');
  eventsBlockHeader   .setAttribute('class', 'stoppageDetailEventsHeader');

  eventsBlockHeader   .innerText = appStrings.stoppageDetail.eventsBlock.header;

  if(stoppageDetail.attachments.events.length === 0)
  {
    eventsBlock       .innerHTML += `<div class="stoppageDetailEventsEmpty">${appStrings.stoppageDetail.eventsBlock.empty}</div>`;
  }

  for(let x = 0; x < stoppageDetail.attachments.events.length; x++)
  {

  }

  eventsBlock         .insertBefore(eventsBlockHeader, eventsBlock.children[0]);
  detailContainer     .appendChild(eventsBlock);
}

/****************************************************************************************************/

function loadStoppageDetailBuildActionsSection(detailContainer, lastEventType)
{
  const actionsBlock          = document.createElement('div');
  const actionsBlockDelayed   = document.createElement('button');
  const actionsBlockRejected  = document.createElement('button');
  const actionsBlockClosed    = document.createElement('button');
  const actionsBlockQuestion  = document.createElement('button');
  const actionsBlockDisputed  = document.createElement('button');

  actionsBlock            .setAttribute('class', 'stoppageDetailActions');

  actionsBlock            .innerHTML += `<div class="header">${appStrings.stoppageDetail.actionsBlockHeader}</div>`;

  actionsBlockDelayed     .innerText = appStrings.addStoppage.correspondences.delayed;
  actionsBlockRejected    .innerText = appStrings.addStoppage.correspondences.rejected;
  actionsBlockClosed      .innerText = appStrings.addStoppage.correspondences.closed;
  actionsBlockQuestion    .innerText = appStrings.addStoppage.correspondences.questionary;
  actionsBlockDisputed    .innerText = appStrings.addStoppage.correspondences.disputed;

  switch(lastEventType)
  {
    case 'rejected':
      actionsBlock.appendChild(actionsBlockDelayed);
      actionsBlock.appendChild(actionsBlockQuestion);
    break;

    case 'delayed':
      actionsBlock.appendChild(actionsBlockRejected);
      actionsBlock.appendChild(actionsBlockClosed);
      actionsBlock.appendChild(actionsBlockQuestion);
    break;

    case 'closed':
      actionsBlock.appendChild(actionsBlockDisputed);
    break;

    case 'questionary':
      actionsBlock.appendChild(actionsBlockRejected);
      actionsBlock.appendChild(actionsBlockDelayed);
      actionsBlock.appendChild(actionsBlockClosed);
    break;

    case 'disputed':

    break;

    default:
      actionsBlock.appendChild(actionsBlockDelayed);
      actionsBlock.appendChild(actionsBlockRejected);
      actionsBlock.appendChild(actionsBlockClosed);
      actionsBlock.appendChild(actionsBlockQuestion);
    break;
  }

  detailContainer.appendChild(actionsBlock);
}

/****************************************************************************************************/

function loadStoppageDetailBuildProlongationsBlock(detailContainer, stoppageDetail)
{
  const prolongationsBlock      = document.createElement('div');
  const prolongationsBlockEmpty = document.createElement('div');
  const prolongationsBlockList  = document.createElement('div');
  const prolongationsBlockAdd   = document.createElement('button');

  prolongationsBlock      .setAttribute('class', 'stoppageDetailProlongations');
  prolongationsBlockEmpty .setAttribute('class', 'empty');
  prolongationsBlockList  .setAttribute('class', 'list');

  prolongationsBlockEmpty .setAttribute('id', 'prolongationsEmpty');
  prolongationsBlockList  .setAttribute('id', 'prolongationsList');

  prolongationsBlock      .innerHTML += `<div class="header">${appStrings.stoppageDetail.prolongationsBlock.header}</div>`;

  prolongationsBlockEmpty .innerText = appStrings.stoppageDetail.prolongationsBlock.emptyList;
  prolongationsBlockAdd   .innerText = appStrings.stoppageDetail.prolongationsBlock.add;

  if(stoppageDetail.prolongations.length === 0)
  {
    prolongationsBlockEmpty.style.display = 'block';
    prolongationsBlockList.style.display = 'none';
  }

  for(let x = 0; x < stoppageDetail.prolongations.length; x++)
  {
    const currentProlongation             = document.createElement('div');
    const currentProlongationDates        = document.createElement('div');
    const currentProlongationAttachment   = document.createElement('div');

    currentProlongation                   .setAttribute('class', 'element');
    currentProlongationDates              .setAttribute('class', 'dates');
    currentProlongationAttachment         .setAttribute('class', 'attachment');

    currentProlongationDates              .innerHTML += `<div class="date"><div class="label">${appStrings.stoppageDetail.prolongationsBlock.datesSection.startDate} :</div><div class="value">${stoppageDetail.prolongations[x].startDate}</div></div>`;
    currentProlongationDates              .innerHTML += `<div class="date"><div class="label">${appStrings.stoppageDetail.prolongationsBlock.datesSection.endDate} :</div><div class="value">${stoppageDetail.prolongations[x].endDate}</div></div>`;

    currentProlongationAttachment         .innerText = stoppageDetail.prolongations[x].attachmentName;

    currentProlongationAttachment         .addEventListener('click', () =>
    {
      window.open(`/queries/stoppage/visualize-attachment/${stoppageDetail.uuid}/${stoppageDetail.prolongations[x].attachmentUuid}`);
    });

    currentProlongation                   .appendChild(currentProlongationDates);
    currentProlongation                   .appendChild(currentProlongationAttachment);
    prolongationsBlockList                .appendChild(currentProlongation);
  }

  prolongationsBlockAdd   .addEventListener('click', () =>
  {
    stoppageDetail.prolongations.length === 0
    ? addProlongationOpenPopup(stoppageDetail.uuid, stoppageDetail.endDate)
    : addProlongationOpenPopup(stoppageDetail.uuid, stoppageDetail.prolongations[stoppageDetail.prolongations.length - 1].endDate);
  });

  prolongationsBlock      .appendChild(prolongationsBlockEmpty);
  prolongationsBlock      .appendChild(prolongationsBlockList);
  prolongationsBlock      .appendChild(prolongationsBlockAdd);
  detailContainer         .appendChild(prolongationsBlock);
}

/****************************************************************************************************/
