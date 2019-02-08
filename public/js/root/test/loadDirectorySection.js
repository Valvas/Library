/****************************************************************************************************/

function loadDirectorySection()
{
  displayLocationLoader();

  urlParameters.length > 0
  ? loadDirectorySectionProfile(urlParameters[0])
  : loadDirectorySectionHome();
}

/****************************************************************************************************/

function loadDirectorySectionHome()
{
  $.ajax(
  {
    type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/root/directory/get-directory-tree', success: () => {},
    error: (xhr, status, error) =>
    {
      if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'loadDirectorySectionError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'loadDirectorySectionError');
    }

  }).done((directory) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/root/directory/get-directory-accounts', success: () => {},
      error: (xhr, status, error) =>
      {
        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'loadDirectorySectionError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'loadDirectorySectionError');
      }

    }).done((result) =>
    {
      const directoryAccounts = result.accounts;

      var directoryContainer  = document.createElement('div');
      var directoryTree       = document.createElement('ul');
      var directoryEmpty      = document.createElement('div');
      var directoryList       = document.createElement('div');

      directoryContainer      .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.directory}</div>`;

      buildDirectoryTree(directory, '0', (array) =>
      {
        directoryTree         .innerHTML = array.join('');

        for(var x = 0; x < directoryAccounts.length; x++)
        {
          const currentAccountUuid = directoryAccounts[x].uuid;

          var currentAccount  = document.createElement('div');
          var accountHeader   = document.createElement('div');
          var accountPicture  = document.createElement('div');
          var accountContent  = document.createElement('div');
          var accountIdentity = document.createElement('div');
          var accountSearch   = document.createElement('input');
          var accountAccess   = document.createElement('button');

          currentAccount      .setAttribute('name', directoryAccounts[x].unitTags[0]);
          currentAccount      .setAttribute('id', currentAccountUuid);

          currentAccount      .setAttribute('class', 'directorySectionAccount');
          accountHeader       .setAttribute('class', 'directorySectionAccountHeader');
          accountPicture      .setAttribute('class', 'directorySectionAccountPicture');
          accountContent      .setAttribute('class', 'directorySectionAccountContent');
          accountIdentity     .setAttribute('class', 'directorySectionAccountContentIdentity');
          accountAccess       .setAttribute('class', 'directorySectionAccountContentAccess');

          accountPicture      .innerHTML += `<div class="directorySectionAccountPictureCircle"><img src="${directoryAccounts[x].picture}" /></div>`;
          accountIdentity     .innerHTML += `<div class="directorySectionAccountContentIdentityName">${directoryAccounts[x].firstname.charAt(0).toUpperCase()}${directoryAccounts[x].firstname.slice(1).toLowerCase()} ${directoryAccounts[x].lastname.charAt(0).toUpperCase()}${directoryAccounts[x].lastname.slice(1).toLowerCase()}</div>`;
          accountIdentity     .innerHTML += `<div class="directorySectionAccountContentIdentityStatus">${directoryAccounts[x].unitName}</div>`;
          accountAccess       .innerText += `${commonStrings.root.directory.accessAccount}`;

          accountAccess       .addEventListener('click', () =>
          {
            //window.history.pushState(null, '', `/directory/${currentAccountUuid}`);
            urlParameters = [currentAccountUuid];
            loadLocation('directory');
          });

          accountContent      .appendChild(accountIdentity);
          accountContent      .appendChild(accountAccess);
          currentAccount      .appendChild(accountHeader);
          currentAccount      .appendChild(accountPicture);
          currentAccount      .appendChild(accountContent);
          directoryList       .appendChild(currentAccount);
        }

        directoryContainer    .setAttribute('class', 'directorySectionBlock');
        directoryTree         .setAttribute('class', 'directorySectionTree');
        directoryList         .setAttribute('class', 'directorySectionList');
        directoryEmpty        .setAttribute('class', 'directorySectionEmpty');
        accountSearch         .setAttribute('class', 'directorySectionSearch');

        directoryEmpty        .innerText = commonStrings.root.directory.emptySearch;

        accountSearch         .setAttribute('placeholder', commonStrings.root.directory.searchBarPlaceholder);
        accountSearch         .setAttribute('type', 'text');

        accountSearch         .addEventListener('input', browseAccountsToDisplay);

        directoryList         .setAttribute('id', 'directorySectionList');
        directoryTree         .setAttribute('id', 'directorySectionTree');
        directoryEmpty        .setAttribute('id', 'directorySectionEmpty');
        accountSearch         .setAttribute('id', 'directorySectionSearch');

        directoryContainer    .appendChild(directoryTree);
        directoryContainer    .appendChild(accountSearch);
        directoryContainer    .appendChild(directoryEmpty);
        directoryContainer    .appendChild(directoryList);

        directoryContainer    .style.display = 'none';

        document.getElementById('locationContent').appendChild(directoryContainer);

        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        $(directoryContainer).fadeIn(250);
      });
    });
  });
}

/****************************************************************************************************/

function loadDirectorySectionProfile(accountUuid)
{
  $.ajax(
  {
    type: 'POST', timeout: 10000, data: { accountUuid: accountUuid }, dataType: 'JSON', url: '/queries/root/directory/get-account-profile', success: () => {},
    error: (xhr, status, error) =>
    {
      if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'loadDirectorySectionError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'loadDirectorySectionError');
    }

  }).done((accountData) =>
  {
    var directoryContainer  = document.createElement('div');

    var directoryProfile    = document.createElement('div');
    var directoryHeader     = document.createElement('div');
    var directoryPicture    = document.createElement('div');
    var directoryAside      = document.createElement('div');
    var directoryIdentity   = document.createElement('div');
    var profileContent      = document.createElement('div');
    var profileEmail        = document.createElement('div');
    var profileContact      = document.createElement('div');
    var directoryReturn     = document.createElement('div');
    var directoryButton     = document.createElement('button');

    directoryContainer      .setAttribute('class', 'directorySectionBlock');
    directoryProfile        .setAttribute('class', 'directoryProfile');
    directoryHeader         .setAttribute('class', 'directoryProfileHeader');
    directoryPicture        .setAttribute('class', 'directoryProfileHeaderPicture');
    directoryAside          .setAttribute('class', 'directoryProfileHeaderAside');
    directoryIdentity       .setAttribute('class', 'directoryProfileHeaderAsideIdentity');
    profileContent          .setAttribute('class', 'directoryProfileContent');
    profileEmail            .setAttribute('class', 'directoryProfileContentBlock');
    profileContact          .setAttribute('class', 'directoryProfileContentBlock');
    directoryReturn         .setAttribute('class', 'directoryProfileReturn');

    directoryContainer      .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.directory}</div>`;
    directoryPicture        .innerHTML += `<img src="${accountData.picture}" />`;
    directoryIdentity       .innerHTML += `<div class="directoryProfileHeaderAsideIdentityName">${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}</div>`;
    directoryIdentity       .innerHTML += `<div class="directoryProfileHeaderAsideIdentityUnit">${accountData.unitName}</div>`;
    directoryButton         .innerText += commonStrings.global.back;
    profileEmail            .innerHTML += `<div class="directoryProfileContentBlockKey">${commonStrings.root.directory.accountDetail.emailLabel} :</div><div class="directoryProfileContentBlockValue">${accountData.email}</div>`;
    profileContact          .innerHTML += accountData.contact_number == null
    ? `<div class="directoryProfileContentBlockKey">${commonStrings.root.directory.accountDetail.phoneLabel} :</div><div class="directoryProfileContentBlockValue">${commonStrings.root.directory.accountDetail.phoneNumberEmpty}</div>`
    : `<div class="directoryProfileContentBlockKey">${commonStrings.root.directory.accountDetail.phoneLabel} :</div><div class="directoryProfileContentBlockValue">+${accountData.contact_number}</div>`;

    directoryButton         .addEventListener('click', () =>
    {
      //window.history.pushState(null, '', `/directory`);
      urlParameters = [];
      loadLocation('directory');
    });

    directoryAside          .appendChild(directoryIdentity);
    directoryHeader         .appendChild(directoryPicture);
    directoryHeader         .appendChild(directoryAside);
    profileContent          .appendChild(profileEmail);
    profileContent          .appendChild(profileContact);
    directoryReturn         .appendChild(directoryButton);
    directoryProfile        .appendChild(directoryHeader);
    directoryProfile        .appendChild(profileContent);
    directoryProfile        .appendChild(directoryReturn);

    directoryContainer      .appendChild(directoryProfile);

    directoryContainer      .style.display = 'none';

    document.getElementById('locationContent').appendChild(directoryContainer);

    if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

    $(directoryContainer).fadeIn(250);
  });
}

/****************************************************************************************************/

function buildDirectoryTree(currentUnit, tag, callback)
{
  var resultArray = [], index = 0;

  var browseUnit = () =>
  {
    tag = `${tag.slice(0, -1)}${index}`;

    tag === '0'
    ? resultArray.push(`<li class="directorySectionTreeElementSelected" tag="${tag}"><span>${Object.keys(currentUnit)[index]}</span>`)
    : resultArray.push(`<li onclick="deployUnit()" class="directorySectionTreeElement" tag="${tag}"><span>${Object.keys(currentUnit)[index]}</span>`);

    if(currentUnit[Object.keys(currentUnit)[index]] == null)
    {
      if(Object.keys(currentUnit)[index += 1] == undefined)
      {
        resultArray.push('</li>');
        return callback(resultArray);
      }

      return browseUnit();
    }

    tag === '0'
    ? resultArray.push('<ul class="directorySectionTreeList">')
    : resultArray.push('<ul class="directorySectionTreeListHidden">');

    buildDirectoryTree(currentUnit[Object.keys(currentUnit)[index]], `${tag}0`, (result) =>
    {
      resultArray.push(result.join(''));

      resultArray.push('</ul></li>');

      if(Object.keys(currentUnit)[index += 1] == undefined) return callback(resultArray);

      browseUnit();
    });
  }

  browseUnit();
}

/****************************************************************************************************/
