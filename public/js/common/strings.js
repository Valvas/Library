/****************************************************************************************************/

function getStorageAppStrings(callback)
{
  $.ajax(
  {
    type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-storage', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON != undefined ?
      callback({ title: 'Erreur', message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ title: 'Erreur', message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }
                        
  }).done((result) =>
  {
    return callback(null, result.strings);
  });
}

/****************************************************************************************************/