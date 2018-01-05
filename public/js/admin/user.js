window.onload = $(() =>
{
  /****************************************************************************************************/

  $('body').on('click', '[name="admin-users-edit-account-button"]', (event) =>
  {
    if($(event.target).parent().attr('name') == 'text')
    {
      $('body').css('overflow', 'hidden');

      openInputPopup(
      {
        name: $(event.target).parent().attr('id'),
        type: $(event.target).parent().attr('name'),
        value: $(event.target).parent().find('div.value').text(),
        placeholder: $(event.target).parent().find('div.key').text()
      });
    }

    if($(event.target).parent().attr('name') == 'select')
    {
      if($(event.target).parent().attr('id') == 'is_admin')
      {
        openSelectPopup(
        {
          name: $(event.target).parent().attr('id'),
          values:
          {
            0: 'Non',
            1: 'Oui'
          }
        });
      }

      else if($(event.target).parent().attr('id') == 'service')
      {
        $.ajax(
        {
          type: 'GET', timeout: 2000, dataType: 'JSON', url: '/service/get-list', success: () => {},
          error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); } 
        
        }).done((json) =>
        {
          var obj = {}, x = 0;

          var loop = () =>
          {
            obj[Object.keys(json.services)[x]] = json.services[Object.keys(json.services)[x]].name;
            
            Object.keys(json.services)[x += 1] != undefined ? loop() :

            openSelectPopup(
            {
              name: $(event.target).parent().attr('id'),
              values: obj
            });
          }

          loop();
        });
      }
    }
  });

  /****************************************************************************************************/

  $('body').on('click', '#user-edit-popup-cancel', (event) =>
  {
    $('body').css('overflow', '');

    $('#user-edit-popup').remove();
    $('#user-edit-veil').remove();
  });

  /****************************************************************************************************/

  $('body').on('click', '#user-edit-popup-confirm', (event) =>
  {
    if($('#user-edit-popup-input').val() == '')
    {
      $('#user-edit-popup-input').css('border', '1px solid red');
    }  

    else
    {
      $.ajax(
      {
        type: 'PUT', timeout: 2000, dataType: 'JSON', data: { account: $('.admin-main-block').attr('name'), key: $('#user-edit-popup-input').attr('name'), value: $('#user-edit-popup-input').val() }, url: '/admin/users/update', success: () => {},
        error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); } 
    
      }).done((json) =>
      {
        printSuccess(json['message']);

        if($('#user-edit-popup-input').attr('name') == 'is_admin' || $('#user-edit-popup-input').attr('name') == 'service')
        {
          var select = document.getElementById('user-edit-popup-input');
          $('#' + $('#user-edit-popup-input').attr('name')).find('div.value').text(select.options[select.selectedIndex].text);
        }

        else
        {
          $('#' + $('#user-edit-popup-input').attr('name')).find('div.value').text(`${$('#user-edit-popup-input').val().charAt(0).toUpperCase()}${$('#user-edit-popup-input').val().slice(1).toLowerCase()}`);
        }

        $('body').css('overflow', '');
 
        $('#user-edit-popup').remove();
        $('#user-edit-veil').remove();
      });
    }
  });

  /****************************************************************************************************/

  $('body').on('focus', '#user-edit-popup-input', (event) =>
  {
    $('#user-edit-popup-input').css('border', '');
  });

  /****************************************************************************************************/

  $('body').on('click', '.create-user-form button', (event) =>
  {
    event.preventDefault();

    var check = true;

    if($('[name="email"]').val() == '')
    {
      check = false;
      $('[name="email"]').css('border', '1px solid red');
    }

    if($('[name="lastname"]').val() == '')
    {
      check = false;
      $('[name="lastname"]').css('border', '1px solid red');
    }

    if($('[name="firstname"]').val() == '')
    {
      check = false;
      $('[name="firstname"]').css('border', '1px solid red');
    }

    if($('[name="service"]').val() == '')
    {
      check = false;
      $('[name="service"]').css('border', '1px solid red');
    }

    if(check)
    {
      var account =
      {
        email: $('[name="email"]').val(),
        lastname: $('[name="lastname"]').val(),
        firstname: $('[name="firstname"]').val(),
        service: $('[name="service"]').val(),
        admin: $('[name="administrator"]').val()
      }

      $.ajax(
      {
        type: 'POST', timeout: 2000, dataType: 'JSON', data: account, url: '/', success: () => {},
        error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); } 
  
      }).done((json) =>
      {
        document.getElementById('create-user-form').reset();

        printSuccess(json['message']);
      });
    }
  });

  /****************************************************************************************************/

  $('body').on('focus', '.create-user-form select, .create-user-form input', (event) =>
  {
    $(event.target).css('border', '');
  });

  /****************************************************************************************************/
});