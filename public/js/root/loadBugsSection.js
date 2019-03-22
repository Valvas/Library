/****************************************************************************************************/

function loadBugsSection()
{
  displayLocationLoader();

  if(urlParameters[0] == undefined) urlParameters[0] = 'list';

  history.pushState(null, null, '/bugs/' + urlParameters.join('/'));

  var bugsContainer    = document.createElement('div');

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

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(bugsContainer).fadeIn(250);
      });

    break;

    case 'create':

      loadBugsSectionForm(bugsContainer, (error) =>
      {
        if(error != null) displayError(error.message, error.detail, 'loadBugsSectionError');

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(bugsContainer).fadeIn(250);
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

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(bugsContainer).fadeIn(250);
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
    const contentHeader         = document.createElement('div');
    const contentHeaderButton   = document.createElement('button');
    const contentEmpty          = document.createElement('div');

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

    for(var x = 0; x < reportsList.length; x++)
    {
      const currentReportUuid = reportsList[x].uuid;

      const currentReport         = document.createElement('div');
      const currentReportHeader   = document.createElement('div');
      const currentReportContent  = document.createElement('div');
      const currentReportFooter   = document.createElement('div');
      const currentReportAccess   = document.createElement('button');

      currentReport               .setAttribute('class', 'bugsListElement');
      currentReportHeader         .setAttribute('class', 'bugsListElementHeader');
      currentReportContent        .setAttribute('class', 'bugsListElementContent');
      currentReportFooter         .setAttribute('class', 'bugsListElementFooter');

      currentReportHeader         .innerHTML += reportsList[x].pending
      ? `<div class="bugsListElementHeaderStatus pending">${commonStrings.root.bugs.status.pending}</div>`
      : reportsList[x].resolved
        ? `<div class="bugsListElementHeaderStatus resolved">${commonStrings.root.bugs.status.resolved}</div>`
        : `<div class="bugsListElementHeaderStatus closed">${commonStrings.root.bugs.status.closed}</div>`;

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

      containerContent            .appendChild(currentReport);
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
    console.log(reportData);

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
    const detailLogsComment   = document.createElement('button');
    const detailLogsEmpty     = document.createElement('div');
    const detailLogsList      = document.createElement('div');

    wrapper             .setAttribute('class', 'bugsDetailWrapper');
    detail              .setAttribute('class', 'bugsDetailBlock');
    detailReturn        .setAttribute('class', 'bugsDetailBlockReturn');
    detailDate          .setAttribute('class', 'bugsDetailBlockInfo');
    detailCreator       .setAttribute('class', 'bugsDetailBlockInfo');

    detailDate          .innerHTML += `<div class="bugsDetailBlockInfoKey">${commonStrings.root.bugs.detail.dateKey} :</div>`;
    detailDate          .innerHTML += `<div class="bugsDetailBlockInfoValue">${reportData.date}</div>`;

    detailCreator       .innerHTML += `<div class="bugsDetailBlockInfoKey">${commonStrings.root.bugs.detail.creatorKey} :</div>`;
    detailCreator       .innerHTML += `<div class="bugsDetailBlockInfoValue">${reportData.creator == null ? commonStrings.root.bugs.detail.unknownCreator : reportData.creator}</div>`;

    detailReturnButton  .innerText = commonStrings.global.back;

    detailReturnButton  .addEventListener('click', () =>
    {
      urlParameters = [];
      loadLocation('bugs');
    });

    detailReturn        .appendChild(detailReturnButton);

    detailLogs          .appendChild(detailLogsComment);
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
