var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppAdminServiceDetailJoin', document.getElementById('serviceDetailBlock').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('serviceNameUpdated', (serviceName, message) =>
{
  document.getElementById('serviceLabel').innerHTML = serviceName.charAt(0).toUpperCase() + serviceName.slice(1).toLowerCase();

  displaySuccessToInformationBlock(message);
});

/****************************************************************************************************/

socket.on('serviceFileSizeUpdated', (serviceFileSize, message) =>
{
  var newFileSize = '';

  if(Math.floor(serviceFileSize / 1024 / 1024 / 1024) >= 1) newFileSize = (serviceFileSize / 1024 / 1024 / 1024).toFixed(2) + 'Go';
  else if(Math.floor(serviceFileSize / 1024 / 1024) >= 1) newFileSize = (serviceFileSize / 1024 / 1024).toFixed(2) + 'Mo';
  else if(Math.floor(serviceFileSize / 1024) >= 1) newFileSize = (serviceFileSize / 1024).toFixed(2) + 'Ko';
  else{ newFileSize = serviceFileSize + 'o'; }

  document.getElementById('serviceFileSize').innerText = newFileSize;

  displaySuccessToInformationBlock(message);
});

/****************************************************************************************************/

socket.on('serviceExtensionsUpdated', (serviceExtensions, allExtensions, message) =>
{
  var extensionBlocks = document.getElementById('serviceDetailBlockExtensionsElements').children;

  for(var x = 0; x < extensionBlocks.length; x++)
  {
    serviceExtensions.includes(extensionBlocks[x].getAttribute('name'))
    ? extensionBlocks[x].children[0].checked = true
    : extensionBlocks[x].children[0].checked = false;
  }

  displaySuccessToInformationBlock(message);
});

/****************************************************************************************************/