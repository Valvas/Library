/****************************************************************************************************/

function addRight(rightToAdd)
{
  openAdminPrompt('addRight', { rightToAdd: rightToAdd });
}

/****************************************************************************************************/

function sendRightToAdd(rightToAdd, strings)
{
  displayPromptLoading();

  var formData = {};

  formData.rightToUpdate = rightToAdd;
  formData.isToBeRemoved = false;
  formData.accountUUID = document.getElementById('rightsDetailAccountInfo').getAttribute('name');

  $.ajax(
  {
    type: 'POST', timeout: 10000, processData: false, data: JSON.stringify(formData), contentType: 'application/json; charset=utf-8', dataType: 'JSON', url: '/queries/admin/rights/update-right', success: () => {},
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

    socket.emit('accountRightsUpdated', document.getElementById('rightsDetailAccountInfo').getAttribute('name'), json.rights, strings);
  });
}

/****************************************************************************************************/
