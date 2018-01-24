var socket = io();

socket.on('connect', () =>
{
  socket.emit('join_report', document.getElementById('report-detail').getAttribute('name'));
});

socket.on('update_comment', (reportUUID) =>
{
  updateAdminReportCommentList(reportUUID);
});