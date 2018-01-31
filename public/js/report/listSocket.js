var socket = io();

socket.on('connect', () =>
{
  socket.emit('join_reports_list');
});

socket.on('update_report_status', () =>
{
  var x = 0;
  var pageSelectors = document.getElementById('pages-container').children;

  var getPageSelectorLoop = () =>
  {
    if(pageSelectors.length == 0) updateReportsList(1);

    else
    {
      if(pageSelectors[x].getAttribute('class') == 'page-selected') updateReportsList(parseInt(pageSelectors[x].getAttribute('tag')));

      else
      {
        if(pageSelectors[x += 1] != undefined) getPageSelectorLoop();
      }
    }
  }

  getPageSelectorLoop();
});

socket.on('update_report_comments', () =>
{
  var x = 0;
  var pageSelectors = document.getElementById('pages-container').children;

  var getPageSelectorLoop = () =>
  {
    if(pageSelectors.length == 0) updateReportsList(1);

    else
    {
      if(pageSelectors[x].getAttribute('class') == 'page-selected') updateReportsList(parseInt(pageSelectors[x].getAttribute('tag')));

      else
      {
        if(pageSelectors[x += 1] != undefined) getPageSelectorLoop();
      }
    }
  }

  getPageSelectorLoop();
});