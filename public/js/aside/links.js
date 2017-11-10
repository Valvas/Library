window.onload = $(function()
{
  $('body').on('click', '[name="aside-navigation-block-link"]', function()
  {
    location = `/service/${$(this).attr('id')}`;
  });
});