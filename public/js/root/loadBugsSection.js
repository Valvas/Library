/****************************************************************************************************/

function loadBugsSection()
{
  displayLocationLoader();

  if(urlParameters[0] == undefined) urlParameters[0] = 'list';

  history.pushState(null, null, '/bugs/' + urlParameters.join('/'));

  const bugsContainer  = document.createElement('div');

  bugsContainer        .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.bugs}</div>`;

  bugsContainer        .setAttribute('class', 'bugsSectionBlock');

  bugsContainer        .style.display = 'none';

  document.getElementById('locationContent').appendChild(bugsContainer);

  /********************************************************************************/

  switch(urlParameters[0])
  {
    case 'list':

      loadBugsSectionList(bugsContainer, (error) =>
      {
        if(error != null) displayError(error.message, error.detail, 'loadBugsSectionError');

        $(document.getElementById('locationLoaderVerticalBlock')).fadeOut(250, () =>
        {
          document.getElementById('locationLoaderVerticalBlock').remove();

          $(bugsContainer).fadeIn(250);
        });
      });

    break;

    case 'create':

      loadBugsSectionForm(bugsContainer, (error) =>
      {
        if(error != null) displayError(error.message, error.detail, 'loadBugsSectionError');

        $(document.getElementById('locationLoaderVerticalBlock')).fadeOut(250, () =>
        {
          document.getElementById('locationLoaderVerticalBlock').remove();

          $(bugsContainer).fadeIn(250);
        });
      });

    break;

    case 'detail':

      if(urlParameters[1] == undefined)
      {
        urlParameters = [];
        return loadLocation('bugs');
      }

      loadBugsSectionDetail(urlParameters[1], bugsContainer, (error) =>
      {
        if(error != null)
        {
          displayError(error.message, error.detail, 'loadBugsSectionError');

          urlParameters = [];
          return loadLocation('bugs');
        }

        $(document.getElementById('locationLoaderVerticalBlock')).fadeOut(250, () =>
        {
          document.getElementById('locationLoaderVerticalBlock').remove();

          $(bugsContainer).fadeIn(250);
        });
      });

    break;
  }
}

/****************************************************************************************************/

function loadBugsSectionList(bugsContainer, callback)
{
  $.ajax(
  {
    type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/root/bugs/get-reports-list', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: commonStrings.global.xhrErrors.timeout, detail: null });
    }

  }).done((result) =>
  {
    const reportsList = result.reportsList;

    const container             = document.createElement('div');
    const containerContent      = document.createElement('div');
    const containerContentList  = document.createElement('div');
    const contentHeader         = document.createElement('div');
    const contentHeaderButton   = document.createElement('button');
    const contentEmpty          = document.createElement('div');

    contentEmpty          .setAttribute('id', 'bugsListEmpty');
    containerContentList  .setAttribute('id', 'bugsList');

    container             .setAttribute('class', 'bugsListContainer');
    containerContent      .setAttribute('class', 'bugsListContent');
    contentHeader         .setAttribute('class', 'bugsListHeader');
    contentEmpty          .setAttribute('class', 'bugsListEmpty');

    contentHeaderButton   .innerText = commonStrings.root.bugs.createNewReportButton;
    contentEmpty          .innerText = commonStrings.root.bugs.emptyListMessage;

    if(reportsList.length === 0) contentEmpty.style.display = 'block';

    contentHeaderButton   .addEventListener('click', () =>
    {
      urlParameters[0] = 'create';
      loadLocation('bugs');
    });

    contentHeader         .appendChild(contentHeaderButton);

    containerContent      .appendChild(contentHeader);
    containerContent      .appendChild(contentEmpty);
    containerContent      .appendChild(containerContentList);

    for(var x = 0; x < reportsList.length; x++)
    {
      const currentReportUuid = reportsList[x].uuid;

      const reportStatusClass = reportsList[x].pending
      ? 'pending'
      : reportsList[x].resolved
        ? 'resolved'
        : 'closed';

      const reportStatusMessage = reportsList[x].pending
      ? commonStrings.root.bugs.status.pending
      : reportsList[x].resolved
        ? commonStrings.root.bugs.status.resolved
        : commonStrings.root.bugs.status.closed;

      const currentReport         = document.createElement('div');
      const currentReportHeader   = document.createElement('div');
      const currentReportStatus   = document.createElement('div');
      const currentReportContent  = document.createElement('div');
      const currentReportFooter   = document.createElement('div');
      const currentReportAccess   = document.createElement('button');

      currentReport               .setAttribute('name', reportsList[x].uuid);

      currentReport               .setAttribute('class', 'bugsListElement');
      currentReportHeader         .setAttribute('class', 'bugsListElementHeader');
      currentReportContent        .setAttribute('class', 'bugsListElementContent');
      currentReportFooter         .setAttribute('class', 'bugsListElementFooter');

      currentReportStatus         .setAttribute('class', `bugsListElementHeaderStatus ${reportStatusClass}`);

      currentReportStatus         .innerText = reportStatusMessage;

      if(reportsList[x].unseenNotifications === true)
      {
        currentReportStatus.innerHTML += `<span>[${commonStrings.root.bugs.unseenNotifications}]</span>`;
      }

      currentReportHeader         .appendChild(currentReportStatus);

      currentReportHeader         .innerHTML += `<div class="bugsListElementHeaderDate">${reportsList[x].date}</div>`;

      currentReportContent        .innerText = reportsList[x].message;
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

      containerContentList         .appendChild(currentReport);
    }

    container             .appendChild(containerContent);
    bugsContainer         .appendChild(container);

    return callback(null);
  });
}

/****************************************************************************************************/

function loadBugsSectionForm(bugsContainer, callback)
{
  const wrapper     = document.createElement('div');
  const form        = document.createElement('form');
  const formTitle   = document.createElement('div');
  const formHelp    = document.createElement('div');
  const formInput   = document.createElement('textarea');
  const formButtons = document.createElement('div');
  const formSubmit  = document.createElement('button');
  const formCancel  = document.createElement('button');

  wrapper       .setAttribute('class', 'bugsCreateWrapper');
  form          .setAttribute('class', 'bugsCreateForm');
  formTitle     .setAttribute('class', 'bugsCreateFormTitle');
  formHelp      .setAttribute('class', 'bugsCreateFormHelp');
  formInput     .setAttribute('class', 'bugsCreateFormInput');
  formButtons   .setAttribute('class', 'bugsCreateFormButtons');
  formSubmit    .setAttribute('class', 'bugsCreateFormButtonsSubmit');
  formCancel    .setAttribute('class', 'bugsCreateFormButtonsCancel');

  formInput     .setAttribute('required', true);
  formInput     .setAttribute('name', 'message');

  form          .setAttribute('id', 'bugReportForm');

  formTitle     .innerText = commonStrings.root.bugs.createForm.title;
  formHelp      .innerText = commonStrings.root.bugs.createForm.help;
  formSubmit    .innerText = commonStrings.root.bugs.createForm.submit;
  formCancel    .innerText = commonStrings.global.cancel;

  form          .addEventListener('submit', createBugReportOpenConfirmModal);

  formCancel    .addEventListener('click', () =>
  {
    event.preventDefault();
    urlParameters[0] = 'list';
    loadLocation('bugs');
  });

  formButtons   .appendChild(formSubmit);
  formButtons   .appendChild(formCancel);

  form          .appendChild(formTitle);
  form          .appendChild(formHelp);
  form          .appendChild(formInput);
  form          .appendChild(formButtons);

  wrapper       .appendChild(form);

  bugsContainer .appendChild(wrapper);

  return callback(null);
}

/****************************************************************************************************/

function loadBugsSectionDetail(reportUuid, bugsContainer, callback)
{
  $.ajax(
  {
    type: 'POST', timeout: 10000, data: { reportUuid: reportUuid }, dataType: 'JSON', url: '/queries/root/bugs/get-report-detail', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: commonStrings.global.xhrErrors.timeout, detail: null });
    }

  }).done((reportData) =>
  {
    const wrapper             = document.createElement('div');
    const detail              = document.createElement('div');
    const detailReturn        = document.createElement('div');
    const detailReturnButton  = document.createElement('button');
    const detailStatus        = document.createElement('div');
    const detailStatusValue   = document.createElement('div');
    const detailStatusUpdate  = document.createElement('button');
    const detailDate          = document.createElement('div');
    const detailCreator       = document.createElement('div');
    const detailContent       = document.createElement('div');
    const detailLogs          = document.createElement('div');
    const detailLogsInput     = document.createElement('textarea');
    const detailLogsComment   = document.createElement('button');
    const detailLogsEmpty     = document.createElement('div');
    const detailLogsList      = document.createElement('div');

    const currentReportStatus = reportData.closed
    ? 'closed'
    : reportData.resolved
      ? 'resolved'
      : 'pending';

    wrapper             .setAttribute('class', 'bugsDetailWrapper');
    detail              .setAttribute('class', 'bugsDetailBlock');
    detailReturn        .setAttribute('class', 'bugsDetailBlockReturn');
    detailStatus        .setAttribute('class', 'bugsDetailStatus');
    detailStatusValue   .setAttribute('class', `bugsDetailStatusValue ${currentReportStatus}`);
    detailDate          .setAttribute('class', 'bugsDetailBlockInfo');
    detailCreator       .setAttribute('class', 'bugsDetailBlockInfo');
    detailContent       .setAttribute('class', 'bugsDetailContent');
    detailLogs          .setAttribute('class', 'bugDetailLogs');
    detailLogsInput     .setAttribute('class', 'bugDetailLogsInput');
    detailLogsComment   .setAttribute('class', 'bugDetailLogsSubmit');
    detailLogsEmpty     .setAttribute('class', 'bugDetailLogsEmpty');
    detailLogsList      .setAttribute('class', 'bugDetailLogsList');

    detail              .setAttribute('id', 'reportUuid');
    detailLogsInput     .setAttribute('id', 'reportComment');

    detail              .setAttribute('name', reportData.uuid)

    detailDate          .innerHTML += `<div class="bugsDetailBlockInfoKey">${commonStrings.root.bugs.detail.dateKey} :</div>`;
    detailDate          .innerHTML += `<div class="bugsDetailBlockInfoValue">${reportData.date}</div>`;

    detailCreator       .innerHTML += `<div class="bugsDetailBlockInfoKey">${commonStrings.root.bugs.detail.creatorKey} :</div>`;
    detailCreator       .innerHTML += `<div class="bugsDetailBlockInfoValue">${reportData.creator == null ? commonStrings.root.bugs.detail.unknownCreator : reportData.creator}</div>`;

    detailReturnButton  .innerText = commonStrings.global.back;
    detailStatusValue   .innerText = commonStrings.root.bugs.detail.status[currentReportStatus];
    detailStatusUpdate  .innerText = commonStrings.root.bugs.detail.updateStatus;
    detailLogsComment   .innerText = commonStrings.root.bugs.detail.logsSubmitButton;

    detailLogsInput     .setAttribute('placeholder', commonStrings.root.bugs.detail.logsInputPlaceholder);

    detailContent       .innerText = reportData.message;
    detailLogsEmpty     .innerText = commonStrings.root.bugs.detail.emptyLogs;

    if(reportData.logs.length === 0)
    {
      detailLogsEmpty.style.display = 'block';
    }

    detailStatusUpdate  .addEventListener('click', updateReportStatusOpenPrompt);

    detailReturnButton  .addEventListener('click', () =>
    {
      urlParameters = [];
      loadLocation('bugs');
    });

    detailLogsComment   .addEventListener('click', postReportCommentOpenPrompt);

    detailReturn        .appendChild(detailReturnButton);

    detailStatus        .appendChild(detailStatusValue);

    if(accountData.isAdmin)
    {
      detailStatus      .appendChild(detailStatusUpdate);
    }

    for(let x = 0; x < reportData.logs.length; x++)
    {
      const currentLogData = reportData.logs[x];

      const logType = currentLogData.pending
      ? 'pending'
      : currentLogData.resolved
        ? 'resolved'
        : currentLogData.closed
          ? 'closed'
          : 'comment';

      const currentLog  = document.createElement('div');

      currentLog        .setAttribute('class', `bugDetailLogsListElement ${logType}`);

      currentLog        .innerHTML += `<div class="bugDetailLogsListElementHeader">${currentLogData.date} - ${currentLogData.creator}</div>`;

      currentLog        .innerHTML += currentLogData.pending
      ? `<div class="bugDetailLogsListElementMessage">${commonStrings.root.bugs.detail.logs.pending.replace('$[1]', '<span class="pending">').replace('$[2]', '</span>')}</div>`
      : currentLogData.resolved
        ? `<div class="bugDetailLogsListElementMessage">${commonStrings.root.bugs.detail.logs.resolved.replace('$[1]', '<span class="resolved">').replace('$[2]', '</span>')}</div>`
        : currentLogData.closed
          ? `<div class="bugDetailLogsListElementMessage">${commonStrings.root.bugs.detail.logs.closed.replace('$[1]', '<span class="closed">').replace('$[2]', '</span>')}</div>`
          : `<div class="bugDetailLogsListElementComment">${currentLogData.message}</div>`;

      detailLogsList    .appendChild(currentLog);
    }

    detailLogs          .appendChild(detailLogsComment);
    detailLogs          .appendChild(detailLogsInput);
    detailLogs          .appendChild(detailLogsEmpty);
    detailLogs          .appendChild(detailLogsList);

    detail              .appendChild(detailReturn);
    detail              .appendChild(detailStatus);
    detail              .appendChild(detailDate);
    detail              .appendChild(detailCreator);
    detail              .appendChild(detailContent);
    detail              .appendChild(detailLogs);

    wrapper             .appendChild(detail);

    bugsContainer       .appendChild(wrapper);

    return callback(null);
  });
}

/****************************************************************************************************/
