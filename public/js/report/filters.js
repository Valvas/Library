window.onload = $(() =>
{
  $('body').on('click', '.reports-main-block .filters .filter input', (event) =>
  {
    event.target.checked ? 
    $(`.reports-main-block .reports-table tr.report.${$(event.target).attr('name')}`).show():
    $(`.reports-main-block .reports-table tr.report.${$(event.target).attr('name')}`).hide();

    for(var i = 0; i < $(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible').length; i++)
    {
      $($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).removeClass('odd even');
      
      i % 2 == 0 ?
      $($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class', `${$($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class')} odd`) :
      $($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class', `${$($(document.querySelectorAll('.reports-main-block .reports-table tr.report')).filter(':visible')[i]).attr('class')} even`);
    }
  });
});