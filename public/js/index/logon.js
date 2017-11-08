window.onload = $(function()
{
  $('body').on('click', '#logon-form-send-button', function(target)
  {
    target.preventDefault();

    var check = true;
    
    if($(document.getElementById('logon-form-email-input')).val() == '')
    {
      $(document.getElementById('logon-form-email-input')).css('border', '1px solid #FF0921');
      check = false;
    }
    
    else{ $(document.getElementById('logon-form-email-input')).css('border', '1px solid #DDDDDD') }
    
    if($(document.getElementById('logon-form-password-input')).val() == '')
    {
      $(document.getElementById('logon-form-password-input')).css('border', '1px solid #FF0921');
      check = false;
    }
    
    else{ $(document.getElementById('logon-form-password-input')).css('border', '1px solid #DDDDDD') }
            
    var email = $('#logon-form-email-input').val(), password = $('#logon-form-password-input').val();

    if(check)
    {
      $.ajax(
      {
        type: 'PUT', timeout: 2000, dataType: 'JSON', data: { 'email-address': email, 'uncrypted-password': password }, url: '/', success: function(){},
        error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }     
      });
    }
  });

  $('body').on('click', '#logon-form-email-input, #logon-form-password-input', function()
  {
    $('#logon-form-email-input').css('border', '1px solid #DDDDDD');
    $('#logon-form-password-input').css('border', '1px solid #DDDDDD');
  });
});