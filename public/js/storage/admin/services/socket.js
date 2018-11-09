/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppAdminServicesList');
});

/****************************************************************************************************/

socket.on('serviceRemoved', (serviceUuid, storageAppStrings) =>
{
  if(document.getElementById(serviceUuid))
  {
    displayInfo(`<b>${document.getElementById(serviceUuid).children[0].innerText}</b> ${storageAppStrings.admin.services.listPage.socketMessages.serviceRemoved.message}`, null, null);

    document.getElementById(serviceUuid).remove();
  }

  if(document.getElementById('servicesList'))
  {
    if(document.getElementById('servicesList').children.length === 0)
    {
      document.getElementById('servicesList').innerHTML = `<div class="servicesListEmpty" id="servicesListEmpty">${storageAppStrings.admin.services.empty}</div>`;
    }
  }
});

/****************************************************************************************************/

socket.on('serviceCreated', (serviceData, storageAppStrings, accountAdminRights) =>
{
  if(document.getElementById('servicesList') == null) return;

  var maxFileSize = '';

  if(parseInt(serviceData.fileLimit) / 1024 / 1024 / 1024 >= 1) maxFileSize = `${parseInt(serviceData.fileLimit) / 1024 / 1024 / 1024} Go`;
  else if(parseInt(serviceData.fileLimit) / 1024 / 1024 >= 1) maxFileSize = `${parseInt(serviceData.fileLimit) / 1024 / 1024} Mo`;
  else if(parseInt(serviceData.fileLimit) / 1024 >= 1) maxFileSize = `${parseInt(serviceData.fileLimit) / 1024} Ko`;
  else{ maxFileSize = `${parseInt(serviceData.fileLimit)} o`; }

  var serviceBlock  = document.createElement('div');

  serviceBlock      .setAttribute('id', serviceData.serviceUuid);
  serviceBlock      .setAttribute('class', 'servicesListBlock');

  serviceBlock      .innerHTML += `<div class="servicesListBlockTitle">${serviceData.serviceName.charAt(0).toUpperCase()}${serviceData.serviceName.slice(1)}</div>`;
  serviceBlock      .innerHTML += `<div class="servicesListBlockKey">${storageAppStrings.admin.services.listPage.serviceBlock.fileSize}</div><div class="servicesListBlockValue">${maxFileSize}</div>`;
  serviceBlock      .innerHTML += `<div class="serviceListBlockUpdate"><div class="serviceListBlockUpdateEnabledMessage">${storageAppStrings.admin.services.listPage.serviceBlock.updateServiceBlock.enabledMessage}</div><a href="/storage/admin/services-management/update/${serviceData.serviceUuid}" class="serviceListBlockUpdateButton">${storageAppStrings.admin.services.listPage.serviceBlock.updateServiceBlock.updateButton}</a></div>`;
  serviceBlock      .innerHTML += `<div class="serviceListBlockRemove"><div class="serviceListBlockRemoveEnabledMessage">${storageAppStrings.admin.services.listPage.serviceBlock.removeServiceBlock.enabledMessage}</div><button class="serviceListBlockRemoveButton" onclick="removeService('${serviceData.serviceUuid}')">${storageAppStrings.admin.services.listPage.serviceBlock.removeServiceBlock.removeButton}</button></div>`;

  if(document.getElementById('servicesListEmpty')) document.getElementById('servicesListEmpty').remove();

  document.getElementById('servicesList').appendChild(serviceBlock);

  displayInfo(`<b>${serviceData.serviceName.charAt(0).toUpperCase()}${serviceData.serviceName.slice(1)}</b> ${storageAppStrings.admin.services.listPage.socketMessages.serviceCreated.message}`, null, null);
});

/****************************************************************************************************/

socket.on('serviceUpdated', (serviceData, storageAppStrings) =>
{
  if(document.getElementById(serviceData.serviceUuid) == null) return;

  const currentServiceName = document.getElementById(serviceData.serviceUuid).children[0].innerText.toLowerCase();

  document.getElementById(serviceData.serviceUuid).children[0].innerText = serviceData.serviceName;

  var maxFileSize = '';

  if(parseInt(serviceData.fileLimit) / 1024 / 1024 / 1024 >= 1) maxFileSize = `${parseInt(serviceData.fileLimit) / 1024 / 1024 / 1024} Go`;
  else if(parseInt(serviceData.fileLimit) / 1024 / 1024 >= 1) maxFileSize = `${parseInt(serviceData.fileLimit) / 1024 / 1024} Mo`;
  else if(parseInt(serviceData.fileLimit) / 1024 >= 1) maxFileSize = `${parseInt(serviceData.fileLimit) / 1024} Ko`;
  else{ maxFileSize = `${parseInt(serviceData.fileLimit)} o`; }

  document.getElementById(serviceData.serviceUuid).children[2].innerText = maxFileSize;

  var infoMessage = '';

  if(serviceData.serviceName === currentServiceName)
  {
    infoMessage = storageAppStrings.admin.services.listPage.socketMessages.serviceUpdated.serviceNameUnmodified.replace('$1$', `<b>${serviceData.serviceName}</b>`);
    displayInfo(infoMessage, null, serviceData.serviceUuid);
  }

  else
  {
    infoMessage = storageAppStrings.admin.services.listPage.socketMessages.serviceUpdated.serviceNameModified.replace('$1$', `<b>${currentServiceName}</b>`);
    infoMessage = infoMessage.replace('$2$', `<b>${serviceData.serviceName}</b>`);
    displayInfo(infoMessage, null, serviceData.serviceUuid);
  }
});

/****************************************************************************************************/