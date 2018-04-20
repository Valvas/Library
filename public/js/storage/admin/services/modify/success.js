/****************************************************************************************************/

function displayPopupSuccess(message, detail)
{
  $(document.getElementById('serviceModificationPopupContent')).slideUp(500, () =>
  {
    document.getElementById('serviceModificationPopupContent').innerHTML = '';

    var successBlock      = document.createElement('div');
    var successMessage    = document.createElement('div');
    var successClose      = document.createElement('button');

    successBlock          .setAttribute('class', 'serviceModificationPopupSuccess');
    successMessage        .setAttribute('class', 'serviceModificationPopupSuccessMessage');
    successClose          .setAttribute('class', 'serviceModificationPopupSuccessClose');

    successMessage        .innerText = message;
    successClose          .innerText = 'OK';

    successClose          .addEventListener('click', closeModifyPopup);

    successBlock          .appendChild(successMessage);
    successBlock          .appendChild(successClose);

    if(detail != null)
    {
      var successDetail     = document.createElement('div');

      successDetail         .innerText = detail;
      successDetail         .setAttribute('class', 'serviceModificationPopupSuccessDetail');

      successBlock          .appendChild(successDetail);
    }

    $(successBlock)         .appendTo(document.getElementById('serviceModificationPopupContent'));

    $(document.getElementById('serviceModificationPopupContent')).slideDown(500);
  });
}

/****************************************************************************************************/