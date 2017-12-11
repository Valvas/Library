window.onload = $(() =>
{
  $('body').on('click', '.service-main-block .service-main-block-table tr', (event) =>
  {
    location = `/file/${$(event.target).parent().attr('id')}`;
  });
});