window.onload = $(() =>
{
  /****************************************************************************************************/

  $('body').on('click', '.check-inactive', (event) =>
  {
    if(document.getElementById('loading') == null)
    {
      if($(event.target).parent().parent().attr('name') != 'access')
      {
        if($('#admin-rights-detail').find('[name="access"]').attr('class').split(' ')[1] == 'false')
        {
          $('#admin-rights-detail').find('[name="access"]').attr('class', 'element true');

          $('#admin-rights-detail').find('[name="access"]').find('.close-active').attr('class', 'fa fa-close close-inactive');
          $('#admin-rights-detail').find('[name="access"]').find('.check-inactive').attr('class', 'fa fa-check check-active');

          if($('#admin-rights-status').find('[name="access"]').length > 0)
          {
            $('#admin-rights-status').find('[name="access"]').remove();
          }

          else
          {
            var element = document.createElement('div');
            $(element).attr({ name: 'access', class: 'history-element plus' });
            $(element).text(`+ ${$('#admin-rights-detail').find('[name="access"]').find('.label').text()}`);
            $(element).appendTo('.admin-rights-status').insertBefore('.admin-rights-status .save');
          }
        }
      }

      if($('.admin-rights-status').find(document.getElementsByName($(event.target).parent().parent().attr('name'))).length == 0)
      {
        $('.admin-rights-status .empty').hide();

        var element = document.createElement('div');
        $(element).attr({ name: $(event.target).parent().parent().attr('name'), class: 'history-element plus' });
        $(element).text(`+ ${$(event.target).parent().parent().find('.label').text()}`);
        $(element).appendTo('.admin-rights-status').insertBefore('.admin-rights-status .save');
      }

      else
      {
        $('.admin-rights-status').find(document.getElementsByName($(event.target).parent().parent().attr('name'))).remove();

        if($('.admin-rights-status .history-element').length == 0) $('.admin-rights-status .empty').show();
      }

      $(event.target).parent().find('.close-active').attr('class', 'fa fa-close close-inactive');
      $(event.target).attr('class', 'fa fa-check check-active');

      $(event.target).parent().parent().attr('class', 'element true');

      $('.admin-rights-status .history-element').length == 0 ? $('.admin-rights-status .save').hide() : $('.admin-rights-status .save').show();
    }
  });

  /****************************************************************************************************/

  $('body').on('click', '.close-inactive', (event) =>
  {
    if(document.getElementById('loading') == null)
    {
      if($('.admin-rights-status').find(document.getElementsByName($(event.target).parent().parent().attr('name'))).length == 0)
      {
        $('.admin-rights-status .empty').hide();

        var element = document.createElement('div');
        $(element).attr({ name: $(event.target).parent().parent().attr('name'), class: 'history-element minus' });
        $(element).text(`- ${$(event.target).parent().parent().find('.label').text()}`);
        $(element).appendTo('.admin-rights-status').insertBefore('.admin-rights-status .save');
      }

      else
      {
        $('.admin-rights-status').find(document.getElementsByName($(event.target).parent().parent().attr('name'))).remove();

        if($('.admin-rights-status .history-element').length == 0) $('.admin-rights-status .empty').show();
      }

      $(event.target).parent().find('.check-active').attr('class', 'fa fa-check check-inactive');
      $(event.target).attr('class', 'fa fa-close close-active');

      $(event.target).parent().parent().attr('class', 'element false');

      if($(event.target).parent().parent().attr('name') == 'access')
      {
        var x = 0;
        var elements = $('#admin-rights-detail .element.true');

        var loop = () =>
        {
          $(elements[x]).find('.check-active').attr('class', 'fa fa-check check-inactive');
          $(elements[x]).find('.close-inactive').attr('class', 'fa fa-close close-active');

          if($(`#admin-rights-status [name="${$(elements[x]).attr('name')}"]`).length > 0)
          {
            $(`#admin-rights-status [name="${$(elements[x]).attr('name')}"]`).remove();
          }

          else
          {
            var element = document.createElement('div');
            $(element).attr({ name: $(elements[x]).attr('name'), class: 'history-element minus' });
            $(element).text(`- ${$(elements[x]).find('.label').text()}`);
            $(element).appendTo('.admin-rights-status').insertBefore('.admin-rights-status .save');
          }

          if(elements[x += 1] != undefined) loop();
        }

        if(elements[x] != undefined) loop();
        $('#admin-rights-detail .element.true').attr('class', 'element false');
      }

      $('.admin-rights-status .history-element').length == 0 ? $('.admin-rights-status .save').hide() : $('.admin-rights-status .save').show();
    }
  });

  /****************************************************************************************************/
});