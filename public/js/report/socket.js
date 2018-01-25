var socket = io();

socket.on('connect', () =>
{
  socket.emit('join_report', document.getElementById('report-detail').getAttribute('name'));
});

socket.on('update_report_status', (status, color, reportUUID) =>
{
  updateReportCommentList(reportUUID);
  printSuccess('Statut mis à jour');
  $('#report-status').text(status);
  $('#report-status').css('color', color);
});

socket.on('update_report_comments', (reportUUID) =>
{
  updateReportCommentList(reportUUID);
});