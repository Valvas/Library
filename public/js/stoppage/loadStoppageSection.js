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
    console.log(result);
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
      const currentStoppage   = document.createElement('div');

      currentStoppage         .innerHTML += `<div>${stoppagesList[x].uuid}</div>`;

      stoppagesListContainer  .appendChild(currentStoppage);
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
    const formAttachments       = document.createElement('div');
    const formAttachmentsAdd    = document.createElement('div');
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
    formAttachments       .innerHTML += `<div id="attachmentsError" class="addStoppageFormBoxError">${appStrings.addStoppage.formErrors.attachmentRequired}</div>`;
    formAttachments       .innerHTML += `<div id="attachmentsEmpty" class="addStoppageFormBoxEmpty">${appStrings.addStoppage.formFields.emptyAttachments}</div>`;

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

    formAttachmentsAdd    .innerText = appStrings.addStoppage.formFields.addAttachment;
    formSubmit            .innerText = appStrings.addStoppage.formFields.submitForm;

    formGenderList        .setAttribute('name', 'gender');
    formEstablishmentList .setAttribute('name', 'establishment');
    formIncidentTypeList  .setAttribute('name', 'type');

    formSubmit            .setAttribute('type', 'submit');

    formAttachments       .setAttribute('id', 'stoppageAttachments');
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
    formAttachments       .setAttribute('class', 'addStoppageFormBox');
    formAttachmentsAdd    .setAttribute('class', 'addStoppageFormBoxAdd');
    formSubmit            .setAttribute('class', 'addStoppageFormSubmit');

    formGender            .appendChild(formGenderList);
    formEstablishment     .appendChild(formEstablishmentList);
    formIncidentType      .appendChild(formIncidentTypeList);

    formAttachments       .appendChild(formAttachmentsAdd);

    formContainer         .appendChild(formIdentifier);
    formContainer         .appendChild(formLastname);
    formContainer         .appendChild(formFirstname);
    formContainer         .appendChild(formGender);
    formContainer         .appendChild(formEstablishment);
    formContainer         .appendChild(formIncidentType);
    formContainer         .appendChild(formStartDate);
    formContainer         .appendChild(formSentDate);
    formContainer         .appendChild(formEndDate);
    formContainer         .appendChild(formAttachments);
    formContainer         .appendChild(formError);
    formContainer         .appendChild(formSubmit);

    formContainer         .addEventListener('submit', createStoppageCheckForm);
    formAttachmentsAdd    .addEventListener('click', createStoppageAddAttachment);

    $(document.getElementById('locationWrapper')).fadeOut(250, () =>
    {
      document.getElementById('locationContainer').innerHTML = `<div class="locationContentTitle">${appStrings.addStoppage.locationLabel}</div>`;

      document.getElementById('locationContainer').appendChild(formContainer);

      $(document.getElementById('locationWrapper')).fadeIn(250);
    });
  });
}

/****************************************************************************************************/
