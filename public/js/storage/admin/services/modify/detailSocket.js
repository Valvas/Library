var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppAdminServiceDetailJoin', document.getElementById('serviceDetailBlock').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('serviceLabelUpdated', (error, serviceLabel) =>
{
  var serviceLabelToArray = serviceLabel.split(' ');

  var x = 0;

  var formatServiceLabel = () =>
  {
    serviceLabelToArray[x] = serviceLabelToArray[x].charAt(0).toUpperCase() + serviceLabelToArray[x].slice(1).toLowerCase();

    if(serviceLabelToArray[x += 1] != undefined) formatServiceLabel();

    else
    {
      document.getElementById('serviceLabel').innerHTML = serviceLabelToArray.join(' ');
    }
  }

  formatServiceLabel();
});

/****************************************************************************************************/

socket.on('serviceFileSizeUpdated', (error, serviceFileSize) =>
{
  var newFileSize = '';

  if(Math.floor(serviceFileSize / 1024 / 1024 / 1024) >= 1) newFileSize = (serviceFileSize / 1024 / 1024 / 1024).toFixed(2) + 'Go';
  else if(Math.floor(serviceFileSize / 1024 / 1024) >= 1) newFileSize = (serviceFileSize / 1024 / 1024).toFixed(2) + 'Mo';
  else if(Math.floor(serviceFileSize / 1024) >= 1) newFileSize = (serviceFileSize / 1024).toFixed(2) + 'Ko';
  else{ newFileSize = serviceFileSize + 'o'; }

  document.getElementById('serviceFileSize').innerText = newFileSize;
});

/****************************************************************************************************/