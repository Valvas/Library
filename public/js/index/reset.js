window.onload = $(() =>
{
  $('body').on('click', 'button', (event) =>
  {
    event.preventDefault();

    if($('[name="email"]').val() == '')
    {
      $('[name="email"]').css('border', '2px solid red');
    }

    else
    {
      $.ajax(
      {
        type: 'PUT', timeout: 5000, dataType: 'JSON', data: { 'email': $('[name="email"]').val() }, url: '/reset-password', success: () => {},
        error: (xhr, status, error) => 
        { 
          if(status == 'timeout') printError('Le serveur a mis trop de temps à répondre');
          else{ printError(JSON.parse(xhr.responseText).message); } 
        } 

      }).done((json) =>
      {
        printSuccess(json.message);
      });
    }
  });

  $('body').on('click', '[name="email"]', (event) =>
  {
    $('[name="email"]').css('border', '');
  });
});