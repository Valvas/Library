window.onload = $(() =>
{
  $('body').on('click', '.admin-comment', (event) =>
  {
    if($(event.target).parent().attr('name') == 0)
    {
      $(event.target).parent().attr('class', 'comment admin-comment log-0');
      $(event.target).parent().attr('name', '1');
    }

    else
    {
      $(event.target).parent().attr('class', 'comment admin-comment log-3');
      $(event.target).parent().attr('name', '0');
    }
  });
});