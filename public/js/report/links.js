window.onload = $(() =>
{
  $('body').on('click', '.reports-main-block .reports-table .report', (event) =>
  {
    location = `/reports/${$(event.target).parent().attr('id')}`;
  });
});