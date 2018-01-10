window.onload = $(() =>
{
  $('body').on('click', '.file-main-block .actions button.download', (event) =>
  {
    location = `/service/download-file/${$('.file-main-block').attr('name')}/${$('.file-main-block').attr('id')}`;
  });
});