/****************************************************************************************************/

socket.on('reportCreated', (reportData) =>
{
  if(document.getElementById('bugsList') === null) return;

  document.getElementById('bugsListEmpty').removeAttribute('style');

  const currentReportUuid = reportData.uuid;

  const reportStatusClass = reportData.pending
  ? 'pending'
  : reportData.resolved
    ? 'resolved'
    : 'closed';

  const reportStatusMessage = reportData.pending
  ? commonStrings.root.bugs.status.pending
  : reportData.resolved
    ? commonStrings.root.bugs.status.resolved
    : commonStrings.root.bugs.status.closed;

  const currentReport         = document.createElement('div');
  const currentReportHeader   = document.createElement('div');
  const currentReportStatus   = document.createElement('div');
  const currentReportContent  = document.createElement('div');
  const currentReportFooter   = document.createElement('div');
  const currentReportAccess   = document.createElement('button');

  currentReport               .setAttribute('name', reportData.uuid);

  currentReport               .setAttribute('class', 'bugsListElement');
  currentReportHeader         .setAttribute('class', 'bugsListElementHeader');
  currentReportContent        .setAttribute('class', 'bugsListElementContent');
  currentReportFooter         .setAttribute('class', 'bugsListElementFooter');

  currentReportStatus         .setAttribute('class', `bugsListElementHeaderStatus ${reportStatusClass}`);

  currentReportStatus         .innerText = reportStatusMessage;

  currentReportStatus.innerHTML += `<span>[${commonStrings.root.bugs.unseenNotifications}]</span>`;

  currentReportHeader         .appendChild(currentReportStatus);

  currentReportHeader         .innerHTML += `<div class="bugsListElementHeaderDate">${reportData.date}</div>`;

  currentReportContent        .innerText = reportData.message;
  currentReportAccess         .innerText = commonStrings.root.bugs.displayReportDetail;

  currentReportAccess         .addEventListener('click', () =>
  {
    urlParameters[0] = 'detail';
    urlParameters[1] = currentReportUuid;

    loadLocation('bugs');
  });

  currentReportFooter         .appendChild(currentReportAccess);

  currentReport               .appendChild(currentReportHeader);
  currentReport               .appendChild(currentReportContent);
  currentReport               .appendChild(currentReportFooter);

  document.getElementById('bugsList').insertBefore(currentReport, document.getElementById('bugsList').children[0]);
});

/****************************************************************************************************/

socket.on('reportLogsUpdated', (logData) =>
{
  if(document.getElementById('bugsList'))
  {
    const reportsList = document.getElementById('bugsList').children;

    if(logData.pending === true)
    {
      for(let x = 0; x < reportsList.length; x++)
      {
        if(reportsList[x].getAttribute('name') !== logData.report) continue;

        const currentReportData = reportsList[x].getElementsByClassName('bugsListElementHeader')[0].children[1].innerText;

        reportsList[x].getElementsByClassName('bugsListElementHeader')[0].innerHTML = `<div class="bugsListElementHeaderStatus pending">${commonStrings.root.bugs.detail.status.pending}<span>[${commonStrings.root.bugs.unseenNotifications}]</span></div>`;
        reportsList[x].getElementsByClassName('bugsListElementHeader')[0].innerHTML += `<div class="bugsListElementHeaderDate">${currentReportData}</div>`;
      }
    }

    /**************************************************/

    else if(logData.closed === true)
    {
      for(let x = 0; x < reportsList.length; x++)
      {
        if(reportsList[x].getAttribute('name') !== logData.report) continue;

        const currentReportData = reportsList[x].getElementsByClassName('bugsListElementHeader')[0].children[1].innerText;

        reportsList[x].getElementsByClassName('bugsListElementHeader')[0].innerHTML = `<div class="bugsListElementHeaderStatus closed">${commonStrings.root.bugs.detail.status.closed}<span>[${commonStrings.root.bugs.unseenNotifications}]</span></div>`;
        reportsList[x].getElementsByClassName('bugsListElementHeader')[0].innerHTML += `<div class="bugsListElementHeaderDate">${currentReportData}</div>`;
      }
    }

    /**************************************************/

    else if(logData.resolved === true)
    {
      for(let x = 0; x < reportsList.length; x++)
      {
        if(reportsList[x].getAttribute('name') !== logData.report) continue;

        const currentReportData = reportsList[x].getElementsByClassName('bugsListElementHeader')[0].children[1].innerText;

        reportsList[x].getElementsByClassName('bugsListElementHeader')[0].innerHTML = `<div class="bugsListElementHeaderStatus resolved">${commonStrings.root.bugs.detail.status.resolved}<span>[${commonStrings.root.bugs.unseenNotifications}]</span></div>`;
        reportsList[x].getElementsByClassName('bugsListElementHeader')[0].innerHTML += `<div class="bugsListElementHeaderDate">${currentReportData}</div>`;
      }
    }
  }

  /**************************************************/

  if(document.getElementById('reportUuid'))
  {
    if(document.getElementById('reportUuid').getAttribute('name') !== logData.report) return;

    document.getElementById('reportUuid').getElementsByClassName('bugDetailLogsEmpty')[0].removeAttribute('style');

    const currentReportLogs = document.getElementById('reportUuid').getElementsByClassName('bugDetailLogsList')[0];
    const currentReportStatus = document.getElementById('reportUuid').getElementsByClassName('bugsDetailStatusValue')[0];

    const currentLog = document.createElement('div');

    currentLog.innerHTML += `<div class="bugDetailLogsListElementHeader">${logData.date} - ${logData.creator}</div>`;

    if(logData.pending === true)
    {
      currentReportStatus.setAttribute('class', 'bugsDetailStatusValue pending');
      currentReportStatus.innerText = commonStrings.root.bugs.detail.status.pending;

      currentLog.setAttribute('class', 'bugDetailLogsListElement pending');
      currentLog.innerHTML += `<div class="bugDetailLogsListElementMessage">${commonStrings.root.bugs.detail.logs.pending.replace('$[1]', '<span class="pending">').replace('$[2]', '</span>')}</div>`;
    }

    else if(logData.closed === true)
    {
      currentReportStatus.setAttribute('class', 'bugsDetailStatusValue closed');
      currentReportStatus.innerText = commonStrings.root.bugs.detail.status.closed;

      currentLog.setAttribute('class', 'bugDetailLogsListElement closed');
      currentLog.innerHTML += `<div class="bugDetailLogsListElementMessage">${commonStrings.root.bugs.detail.logs.closed.replace('$[1]', '<span class="closed">').replace('$[2]', '</span>')}</div>`;
    }

    else if(logData.resolved === true)
    {
      currentReportStatus.setAttribute('class', 'bugsDetailStatusValue resolved');
      currentReportStatus.innerText = commonStrings.root.bugs.detail.status.resolved;

      currentLog.setAttribute('class', 'bugDetailLogsListElement resolved');
      currentLog.innerHTML += `<div class="bugDetailLogsListElementMessage">${commonStrings.root.bugs.detail.logs.resolved.replace('$[1]', '<span class="resolved">').replace('$[2]', '</span>')}</div>`;
    }

    else if(logData.comment === true)
    {
      currentLog.setAttribute('class', 'bugDetailLogsListElement comment');
      currentLog.innerHTML += `<div class="bugDetailLogsListElementComment">${logData.message}</div>`;
    }

    currentReportLogs.insertBefore(currentLog, currentReportLogs.children[0]);
  }
});

/****************************************************************************************************/
