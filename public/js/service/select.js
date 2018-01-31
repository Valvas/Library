window.onload = $(() =>
{
  $('body').on('click', '.service-main-block .table-container .table .file', (event) =>
  {
    if(event.target.nodeName != 'I') location = `/file/${$(event.target).parent().attr('id')}`;
  });
});