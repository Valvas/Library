/****************************************************************************************************/

function loadHomeSection()
{
  displayLocationLoader();

  urlParameters = [];

  history.pushState(null, null, '/storage/home');

  const homeContainer       = document.createElement('div');
  const servicesContainer   = document.createElement('div');
  const containerHeader     = document.createElement('div');
  const containerMessages   = document.createElement('div');
  const messageEmptyList    = document.createElement('div');
  const messageEmptySearch  = document.createElement('div');
  const headerSearch        = document.createElement('input');
  const containerList       = document.createElement('div');

  messageEmptyList        .setAttribute('id', 'emptyServicesList');
  messageEmptySearch      .setAttribute('id', 'emptyServicesSearch');
  containerList           .setAttribute('id', 'homeServicesContainerList');

  homeContainer           .setAttribute('class', 'homeSectionBlock');
  servicesContainer       .setAttribute('class', 'homeServicesContainer');
  containerHeader         .setAttribute('class', 'homeServicesContainerHeader');
  headerSearch            .setAttribute('class', 'homeServicesContainerHeaderSearch');
  containerMessages       .setAttribute('class', 'homeServicesContainerMessages');
  containerList           .setAttribute('class', 'homeServicesContainerList');

  messageEmptyList        .innerText = storageStrings.homeSection.servicesContainer.emptyServices;
  messageEmptySearch      .innerText = storageStrings.homeSection.servicesContainer.emptySearch;

  if(Object.keys(servicesData).length === 0) messageEmptyList.style.display = 'block';

  headerSearch            .setAttribute('placeholder', storageStrings.homeSection.servicesContainer.searchPlaceholder);

  headerSearch            .addEventListener('input', searchForServices);

  homeContainer           .innerHTML = `<div class="homeSectionBlockHeader">${storageStrings.homeSection.headerTitle}</div>`;

  for(let service in servicesData)
  {
    const currentServiceUuid = service;
    const currentServiceData = servicesData[service];

    let currentServiceFileMaxSize = parseInt(currentServiceData.fileLimit);

    const amountOfTo = Math.floor((((currentServiceFileMaxSize / 1024) / 1024) / 1024) / 1024);
    currentServiceFileMaxSize -= (amountOfTo * 1024 * 1024 * 1024 * 1024);

    const amountOfGo = Math.floor(((currentServiceFileMaxSize / 1024) / 1024) / 1024);
    currentServiceFileMaxSize -= (amountOfGo * 1024 * 1024 * 1024);

    const amountOfMo = Math.floor((currentServiceFileMaxSize / 1024) / 1024);
    currentServiceFileMaxSize -= (amountOfMo * 1024 * 1024);

    const amountOfKo = Math.floor((currentServiceFileMaxSize / 1024));
    currentServiceFileMaxSize -= (amountOfKo * 1024);

    let maxFileSize = `${currentServiceFileMaxSize}o`;

    if(amountOfTo > 0) maxFileSize = `${amountOfTo},${(amountOfGo / 1024).toFixed(2).split('.')[1]}To`;

    else if(amountOfGo > 0) maxFileSize = `${amountOfGo},${(amountOfMo / 1024).toFixed(2).split('.')[1]}Go`;

    else if(amountOfMo > 0) maxFileSize = `${amountOfMo},${(amountOfKo / 1024).toFixed(2).split('.')[1]}Mo`;

    else if(amountOfKo > 0) maxFileSize = `${amountOfKo},${(currentServiceFileMaxSize / 1024).toFixed(2).split('.')[1]}Ko`;

    const serviceBlock        = document.createElement('div');
    const serviceBlockName    = document.createElement('div');
    const serviceBlockContent = document.createElement('div');
    const contentStats        = document.createElement('div');
    const contentAccess       = document.createElement('div');
    const accessButton        = document.createElement('button');

    serviceBlock          .setAttribute('id', service);

    serviceBlock          .setAttribute('class', 'homeServicesContainerListElement');
    serviceBlockName      .setAttribute('class', 'homeServicesContainerListElementName');
    serviceBlockContent   .setAttribute('class', 'homeServicesContainerListElementContent');
    contentStats          .setAttribute('class', 'homeServicesContainerListElementContentStats');
    contentAccess         .setAttribute('class', 'homeServicesContainerListElementContentAccess');

    serviceBlockName      .innerText = `${currentServiceData.name.charAt(0).toUpperCase()}${currentServiceData.name.slice(1).toLowerCase()}`;
    accessButton          .innerText = storageStrings.homeSection.servicesContainer.accessButton;

    contentStats          .innerHTML += `<div class="homeServicesContainerListElementContentStatsData"><div class="homeServicesContainerListElementContentStatsKey">${storageStrings.homeSection.servicesContainer.amountOfFolders} :</div><div class="homeServicesContainerListElementContentStatsValue">${currentServiceData.amountOfFolders}</div></div>`;
    contentStats          .innerHTML += `<div class="homeServicesContainerListElementContentStatsData"><div class="homeServicesContainerListElementContentStatsKey">${storageStrings.homeSection.servicesContainer.amountOfFiles} :</div><div class="homeServicesContainerListElementContentStatsValue">${currentServiceData.amountOfFiles}</div></div>`;
    contentStats          .innerHTML += `<div class="homeServicesContainerListElementContentStatsData"><div class="homeServicesContainerListElementContentStatsKey">${storageStrings.homeSection.servicesContainer.fileMaxSize} :</div><div class="homeServicesContainerListElementContentStatsValue">${maxFileSize}</div></div>`;

    accessButton          .addEventListener('click', () =>
    {
      urlParameters.push(currentServiceUuid);
      loadLocation('service');
    });

    if(currentServiceData.hasAccess) contentAccess.appendChild(accessButton);

    if(currentServiceData.hasAccess == false) contentAccess.innerHTML += `<div>${storageStrings.homeSection.servicesContainer.noAccess}</div>`;

    serviceBlockContent   .appendChild(contentStats);
    serviceBlockContent   .appendChild(contentAccess);
    serviceBlock          .appendChild(serviceBlockName);
    serviceBlock          .appendChild(serviceBlockContent);
    containerList         .appendChild(serviceBlock);
  }

  homeContainer           .style.display = 'none';

  containerMessages       .appendChild(messageEmptyList);
  containerMessages       .appendChild(messageEmptySearch);
  containerHeader         .appendChild(headerSearch);
  servicesContainer       .appendChild(containerHeader);
  servicesContainer       .appendChild(containerMessages);
  servicesContainer       .appendChild(containerList);
  homeContainer           .appendChild(servicesContainer);

  document.getElementById('contentContainer').appendChild(homeContainer);

  $(document.getElementById('locationLoaderContainer')).fadeOut(250, () =>
  {
    document.getElementById('locationLoaderContainer').remove();

    $(homeContainer).fadeIn(250);
  });
}

/****************************************************************************************************/
