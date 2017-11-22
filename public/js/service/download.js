window.onload = $(function()
{
  $('body').on('click', '[name="service-main-block-buttons-download"]', function(event)
  {
    location = `/service/download-file/${$('#service-main-block').attr('name')}/${$(event.target).parent().parent().attr('id')}`;
  });
});