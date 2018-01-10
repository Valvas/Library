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
      subjectLabel: 'A quel sujet ?',
      descriptionLabel: 'Description :',
      infoMessage: 'Avant d\'envoyer un rapport veuillez vous assurer que quelqu\'un n\'a pas déjà formulé une demande similaire. Rendez-vous dans "Rapports".',
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
    $('body').css('overflow', '');
    $('#report-popup').remove();
    $('#veil').remove();
  });

  /****************************************************************************************************/

  $('body').on('click', '#report-popup-send', (event) =>
  {
    var check = true;

    if($('#report-popup-list').val() == '')
    {
      $('#report-popup-list').css('background-color', '#FF6347');
      check = false;
    }

    if($('#report-popup-subject').val() == '')
    {
      $('#report-popup-subject').css('background-color', '#FF6347');
      check = false;
    }

    if($('#report-popup-description').val() == '')
    {
      $('#report-popup-description').css('background-color', '#FF6347');
      check = false;
    }

    if(check)
    {
      $.ajax(
      {
        type: 'POST', timeout: 2000, dataType: 'JSON', data: { reportType: $('#report-popup-list').val(), reportSubject: $('#report-popup-subject').val(), reportContent: $('#report-popup-description').val() }, url: '/reports', success: () => {},
        error: (xhr, status, error) => printError(JSON.parse(xhr.responseText).message)
                      
      }).done((json) =>
      {
        printSuccess(json.message);

        $('body').css('overflow', 'auto');
        $('#report-popup').remove();
        $('#veil').remove();
      });
    }
  });

  /****************************************************************************************************/

  $('body').on('click', '#report-popup-list', (event) =>
  {
    $(event.target).css('background-color', '#FFFFFF');
  });

  /****************************************************************************************************/
  
  $('body').on('click', '#report-popup-subject', (event) =>
  {
    $(event.target).css('background-color', '#FFFFFF');
  });

  /****************************************************************************************************/
  
  $('body').on('click', '#report-popup-description', (event) =>
  {
    $(event.target).css('background-color', '#FFFFFF');
  });

  /****************************************************************************************************/
});