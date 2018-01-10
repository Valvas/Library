window.onload = $(() =>
{
  $('body').on('click', '.service-main-block .service-main-block-table tr', (event) =>
  {
    if(event.target.nodeName != 'I') location = `/file/${$(event.target).parent().attr('id')}`;
  });
});