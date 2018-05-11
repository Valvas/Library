/****************************************************************************************************/

function addAccess(appName)
{
  openAdminPrompt('addAccess', { appName: appName });
}

/****************************************************************************************************/

function sendAppToGiveAccess(appName, strings)
{
  displayPromptLoading();

  var formData = {};

  formData.appAccessToUpdate = appName;
  formData.giveAccess = true;
  formData.accountUUID = document.getElementById('accessDetailAccountInfo').getAttribute('name');

  $.ajax(
  {
    type: 'POST', timeout: 10000, processData: false, data: JSON.stringify(formData), contentType: 'application/json; charset=utf-8', dataType: 'JSON', url: '/queries/admin/access/update-access', success: () => {},
    error: (xhr, status, error) =>
    {
      if(xhr.responseJSON == undefined)
      {
        displayPromptError('La requête a expiré, veuillez réessayer plus tard', null);
      }

      else
      {
        displayPromptError(xhr.responseJSON.message, xhr.responseJSON.detail);
      }
    }
                    
  }).done((json) => 
  {
    displayPromptSuccess(json.message);

    socket.emit('accountAccessUpdated', document.getElementById('accessDetailAccountInfo').getAttribute('name'), json.access, strings);
  });
}

/****************************************************************************************************/