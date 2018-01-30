var socket = io();

socket.on('connect', () =>
{
  socket.emit('join_reports_list');
});

socket.on('update_report_status', () =>
{
  updateReportsList();
});

socket.on('update_report_comments', () =>
{
  updateReportsList();
});