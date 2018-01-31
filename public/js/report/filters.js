window.onload = $(() =>
{
  /****************************************************************************************************/

  $('body').on('click', '.reports-main-block .filters .filter input', (event) =>
  {
    var select = document.getElementById('status');

    if(select.options[select.selectedIndex].value == 'all')
    {
      displayReportsInAllStatus(document.getElementById('filters').getElementsByTagName('input')[0].checked, document.getElementById('filters').getElementsByTagName('input')[1].checked);
    }

    else
    {
      applyFilterOnReports(select.options[select.selectedIndex].value, document.getElementById('filters').getElementsByTagName('input')[0].checked, document.getElementById('filters').getElementsByTagName('input')[1].checked);
    }
  });

  /****************************************************************************************************/

  $('#status').on('change', (event) =>
  {
    var select = document.getElementById('status');
    select.style.color = select.options[select.selectedIndex].style.getPropertyValue('color');

    if(select.options[select.selectedIndex].value == 'all')
    {
      displayReportsInAllStatus(document.getElementById('filters').getElementsByTagName('input')[0].checked, document.getElementById('filters').getElementsByTagName('input')[1].checked);
    }

    else
    {
      applyFilterOnReports(select.options[select.selectedIndex].value, document.getElementById('filters').getElementsByTagName('input')[0].checked, document.getElementById('filters').getElementsByTagName('input')[1].checked);
    }
  });

  /****************************************************************************************************/
});