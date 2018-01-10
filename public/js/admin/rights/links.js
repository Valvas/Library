window.onload = $(() =>
{
  $('body').on('click', '.admin-rights-table .values td', (event) =>
  {
    location = `/admin/rights/${$(event.target).parent().attr('id')}`;
  });

  $('body').on('click', '[name="admin-rights-service"]', (event) =>
  {
    location = `/admin/rights/${$('#admin-main-block').attr('name')}/${$(event.target).attr('id')}`;
  });
});