/****************************************************************************************************/

function displayPopupError(message, detail)
{
  $(document.getElementById('serviceModificationPopupContent')).slideUp(500, () =>
  {
    document.getElementById('serviceModificationPopupContent').innerHTML = '';

    var errorBlock      = document.createElement('div');
    var errorMessage    = document.createElement('div');
    var errorClose      = document.createElement('button');

    errorBlock          .setAttribute('class', 'serviceModificationPopupError');
    errorMessage        .setAttribute('class', 'serviceModificationPopupErrorMessage');
    errorClose          .setAttribute('class', 'serviceModificationPopupErrorClose');

    errorMessage        .innerText = message;
    errorClose          .innerText = 'OK';

    errorClose          .addEventListener('click', closeModifyPopup);

    errorBlock          .appendChild(errorMessage);
    errorBlock          .appendChild(errorClose);

    if(detail != null)
    {
      var errorDetail     = document.createElement('div');

      errorDetail         .innerText = detail;
      errorDetail         .setAttribute('class', 'serviceModificationPopupErrorDetail');

      errorBlock          .appendChild(errorDetail);
    }

    $(errorBlock)         .appendTo(document.getElementById('serviceModificationPopupContent'));

    $(document.getElementById('serviceModificationPopupContent')).slideDown(500);
  });
}

/****************************************************************************************************/

function closeModifyPopup()
{
  if(document.getElementById('serviceModificationPopup'))
  {
    $(document.getElementById('serviceModificationPopup')).fadeOut(500, () =>
    {
      $(document.getElementById('serviceModificationBackground')).fadeOut(250, () =>
      {
        document.getElementById('serviceModificationPopup').remove();
        document.getElementById('serviceModificationBackground').remove();
      });
    });
  }

  if(document.getElementById('serviceMaxFileSizeModificationPopup'))
  {
    $(document.getElementById('serviceMaxFileSizeModificationPopup')).fadeOut(500, () =>
    {
      $(document.getElementById('serviceModificationBackground')).fadeOut(250, () =>
      {
        document.getElementById('serviceMaxFileSizeModificationPopup').remove();
        document.getElementById('serviceModificationBackground').remove();
      });
    });
  }
}

/****************************************************************************************************/