/****************************************************************************************************/

socket.emit('storageAppHomeJoin');

/****************************************************************************************************/

socket.on('homeFileUploaded', (serviceUuid) =>
{
  if(servicesData === undefined) return;
  if(servicesData[serviceUuid] === undefined) return;

  servicesData[serviceUuid].amountOfFiles += 1;

  if(document.getElementById(serviceUuid) === null) return;

  document.getElementById(serviceUuid).children[1].children[0].children[1].children[1].innerText = servicesData[serviceUuid].amountOfFiles;
});

/****************************************************************************************************/

socket.on('homeFileRemoved', (serviceUuid) =>
{
  if(servicesData === undefined) return;
  if(servicesData[serviceUuid] === undefined) return;

  servicesData[serviceUuid].amountOfFiles -= 1;

  if(document.getElementById(serviceUuid) === null) return;

  document.getElementById(serviceUuid).children[1].children[0].children[1].children[1].innerText = servicesData[serviceUuid].amountOfFiles;
});

/****************************************************************************************************/

socket.on('homeFolderCreated', (serviceUuid) =>
{
  if(servicesData === undefined) return;
  if(servicesData[serviceUuid] === undefined) return;

  servicesData[serviceUuid].amountOfFolders += 1;

  if(document.getElementById(serviceUuid) === null) return;

  document.getElementById(serviceUuid).children[1].children[0].children[0].children[1].innerText = servicesData[serviceUuid].amountOfFolders;
});

/****************************************************************************************************/

socket.on('homeFolderRemoved', (serviceUuid) =>
{
  if(servicesData === undefined) return;
  if(servicesData[serviceUuid] === undefined) return;

  servicesData[serviceUuid].amountOfFolders -= 1;

  if(document.getElementById(serviceUuid) === null) return;

  document.getElementById(serviceUuid).children[1].children[0].children[0].children[1].innerText = servicesData[serviceUuid].amountOfFolders;
});

/****************************************************************************************************/
