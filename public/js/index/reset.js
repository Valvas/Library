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
        type: 'PUT', timeout: 2000, dataType: 'JSON', data: { 'email': $('[name="email"]').val() }, url: '/reset-password', success: () => {},
        error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); } 

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