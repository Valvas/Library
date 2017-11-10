window.onload = $(function()
{
  $('body').on('click', '#logon-form-send-button', function(target)
  {
    target.preventDefault();
    
    $(document.getElementById('logon-form-email-input')).val() == '' ?
    $(document.getElementById('logon-form-email-input')).css('border', '1px solid #FF0921'):
    $(document.getElementById('logon-form-email-input')).css('border', '1px solid #DDDDDD');
    
    $(document.getElementById('logon-form-password-input')).val() == '' ?
    $(document.getElementById('logon-form-password-input')).css('border', '1px solid #FF0921'):
    $(document.getElementById('logon-form-password-input')).css('border', '1px solid #DDDDDD');

    if($(document.getElementById('logon-form-email-input')).val() != '' && $(document.getElementById('logon-form-password-input')).val() != '')
    {
      var email = $('#logon-form-email-input').val(), password = $('#logon-form-password-input').val();

      $.ajax(
      {
        type: 'PUT', timeout: 2000, dataType: 'JSON', data: { 'emailAddress': email, 'uncryptedPassword': password }, url: '/', success: function(){},
        error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); } 

      }).done(function(json)
      {
        json['result'] == true ? location = '/home' : printError(json['message']);
      });
    }
  });

  $('body').on('click', '#logon-form-email-input, #logon-form-password-input', function()
  {
    $('#logon-form-email-input').css('border', '1px solid #DDDDDD');
    $('#logon-form-password-input').css('border', '1px solid #DDDDDD');
  });
});