window.onload = $(() =>
{
  $('body').on('click', '[name="service-main-block-buttons-download"]', (event) =>
  {
    location = `/service/download-file/${$('#service-main-block').attr('name')}/${$(event.target).parent().parent().attr('id')}`;
  });
});