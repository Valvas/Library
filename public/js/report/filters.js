window.onload = $(() =>
{
  /****************************************************************************************************/

  $('body').on('click', '.reports-main-block .filters .filter input', (event) =>
  {
    if(event.target.checked)
    {
      if($('#status').val() == 'all') $(`.reports-main-block .reports-table tr.report.${$(event.target).attr('name')}`).show();

      else
      {
        $(`.reports-main-block .reports-table`).find(`tr.report.${$(event.target).attr('name')}.${$('#status').val()}`).show();
      }
    }

    else
    {
      $(`.reports-main-block .reports-table tr.report.${$(event.target).attr('name')}`).hide();
    }

    updateRowsBackgroundColor();
  });

  /****************************************************************************************************/

  $('#status').on('change', (event) =>
  {
    $('#status').css('color', $('#status').find(':selected').css('color'));

    if($('#status').val() == 'all') $(`.reports-main-block .reports-table tr.report`).show();

    else
    {
      $(`.reports-main-block .reports-table tr.report`).hide();
      $(`.reports-main-block .reports-table tr.report.${$('#status').val()}`).show();
    }

    for(var i = 0; i < $(document.querySelectorAll('.reports-main-block .filters .filter input')).length; i++)
    {
      if($(document.querySelectorAll('.reports-main-block .filters .filter input'))[i].checked == false) 
      {
        $(`.reports-main-block .reports-table tr.report.${$(document.querySelectorAll('.reports-main-block .filters .filter input')[i]).attr('name')}`).hide();
      }
    }

    updateRowsBackgroundColor();
  });

  /****************************************************************************************************/

  function updateRowsBackgroundColor()
  {
    for(var i = 0; i < $(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible').length; i++)
    {
      $($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).removeClass('odd even');
      
      i % 2 == 0 ?
      $($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class', `${$($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class')} odd`) :
      $($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class', `${$($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class')} even`);
    }
  }

  /****************************************************************************************************/
});