window.onload = $(() =>
{
  /****************************************************************************************************/

  $('body').on('click', '.check-inactive', (event) =>
  {
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

    $('.admin-rights-status .history-element').length == 0 ? $('.admin-rights-status .save').hide() : $('.admin-rights-status .save').show();
  });

  /****************************************************************************************************/

  $('body').on('click', '.close-inactive', (event) =>
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

    $('.admin-rights-status .history-element').length == 0 ? $('.admin-rights-status .save').hide() : $('.admin-rights-status .save').show();
  });

  /****************************************************************************************************/
});