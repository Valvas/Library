window.onload = $(function()
{
  $('body').on('click', '[name="admin-users-table-row"]', (event) =>
  {
    location = `/admin/users/${$(event.target).parent().attr('id')}`;
  });

  $('body').on('click', '#create-user-button', (event) =>
  {
    location = `/admin/users/create`;
  });
});