'use strict'

let createStoppageXhr = null;

/****************************************************************************************************/
/****************************************************************************************************/

function createStoppageCheckForm(event)
{
  event.preventDefault();

  if(createStoppageXhr !== null) return;

  createStoppageXhr = new XMLHttpRequest();

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
  const attachmentFile        = event.target.elements['attachmentFile'].files[0];
  const attachmentComment     = event.target.elements['attachmentComment'].value.trim();

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
    createStoppageXhr = null;
    event.target.elements['identifier'].value = '';
    return document.getElementById('identifierError').style.display = 'block';
  }

  if(employeeLastname.length === 0)
  {
    createStoppageXhr = null;
    event.target.elements['lastname'].value = '';
    return document.getElementById('lastnameError').style.display = 'block';
  }

  if(employeeFirstname.length === 0)
  {
    createStoppageXhr = null;
    event.target.elements['firstname'].value = '';
    return document.getElementById('firstnameError').style.display = 'block';
  }

  if(incidentStartDate.length === 0)
  {
    createStoppageXhr = null;
    event.target.elements['start'].value = '';
    return document.getElementById('startError').style.display = 'block';
  }

  if(incidentSentDate.length === 0)
  {
    createStoppageXhr = null;
    event.target.elements['sent'].value = '';
    return document.getElementById('sentError').style.display = 'block';
  }

  if(incidentEndDate.length === 0)
  {
    createStoppageXhr = null;
    event.target.elements['end'].value = '';
    return document.getElementById('endError').style.display = 'block';
  }

  if(attachmentFile === undefined)
  {
    createStoppageXhr = null;
    return document.getElementById('attachmentError').style.display = 'block';
  }

  /**************************************************/

  if(startDate > sentDate)
  {
    createStoppageXhr = null;
    event.target.elements['sent'].value = '';
    return document.getElementById('sentError').style.display = 'block';
  }

  if(startDate > endDate)
  {
    createStoppageXhr = null;
    event.target.elements['end'].value = '';
    return document.getElementById('endError').style.display = 'block';
  }

  /**************************************************/

  createLoader(appStrings.addStoppage.loaderMessage);

  const data  = new FormData();

  createStoppageXhr.responseType = 'json';
  createStoppageXhr.timeout = 10000;

  data.append('registrationNumber', employeeIdentifier);
  data.append('employeeFirstname', employeeFirstname);
  data.append('employeeLastname', employeeLastname);
  data.append('employeeIsMale', employeeGender === 1);
  data.append('establishment', employeeEstablishment);
  data.append('incidentType', incidentType);
  data.append('startDate', Date.parse(startDate));
  data.append('sentDate', Date.parse(sentDate));
  data.append('endDate', Date.parse(endDate));
  data.append('attachmentFile', attachmentFile);
  data.append('attachmentComment', attachmentComment);

  createStoppageXhr.open('POST', '/queries/stoppage/create-stoppage', true);

  createStoppageXhr.send(data);

  createStoppageXhr.ontimeout = () =>
  {
    createStoppageXhr = null;
    closeLoader();

    displayError(commonStrings.global.xhrErrors.timeout, null, 'createStoppageError');
  }

  createStoppageXhr.onload = () =>
  {
    closeLoader();

    if(createStoppageXhr.status === 201)
    {
      event.target.reset();

      displaySuccess(createStoppageXhr.response.message, 'createStoppageSuccess');

      createStoppageXhr = null;
    }

    else
    {
      displayError(createStoppageXhr.response.message, createStoppageXhr.response.detail, 'createStoppageError');

      createStoppageXhr = null;
    }
  }
}

/****************************************************************************************************/
/****************************************************************************************************/
