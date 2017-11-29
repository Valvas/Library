window.onload = $(function()
{
  /****************************************************************************************************/

  $('body').on('click', '#report-button', (event) =>
  {
    $('body').css('overflow', 'hidden');

    openReportPopup(
    {
      title: 'Rapport',
      listLabel: 'De quoi s\'agit-il ?',
      descriptionLabel: 'Description :',
      list:
      {
        bug: 'Un bug',
        upgrade: 'Une proposition d\'amélioration'
      }
    });
  });

  /****************************************************************************************************/

  $('body').on('click', '#report-popup-cancel', (event) =>
  {
    $('body').css('overflow', 'auto');
    $('#report-popup').remove();
    $('#veil').remove();
  });

  /****************************************************************************************************/

  $('body').on('click', '#report-popup-send', (event) =>
  {
    $('body').css('overflow', 'auto');
    $('#report-popup').remove();
    $('#veil').remove();
  });

  /****************************************************************************************************/
});