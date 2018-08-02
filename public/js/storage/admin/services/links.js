/****************************************************************************************************/

if(document.getElementById('create-service-button')) document.getElementById('create-service-button').addEventListener('click', linkToForm);

/****************************************************************************************************/

function linkToForm(event)
{
  location = '/storage/admin/services/form';
}

/****************************************************************************************************/

function openServiceDetail(serviceUuid)
{
  location = `/storage/admin/services/detail/${serviceUuid}`;
}

/****************************************************************************************************/