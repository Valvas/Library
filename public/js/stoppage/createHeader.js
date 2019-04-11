/****************************************************************************************************/

function createHeader(callback)
{
  const header                = document.createElement('div');
  const navigationBar         = document.createElement('div');
  const navigationTitle       = document.createElement('div');
  const navigationAccount     = document.createElement('div');
  const accountBlock          = document.createElement('div');
  const accountBlockData      = document.createElement('div');
  const accountMenu           = document.createElement('div');
  const accountMenuList       = document.createElement('ul');

  header            .setAttribute('class', 'headerBlock');
  navigationBar     .setAttribute('class', 'navigationBar');
  navigationTitle   .setAttribute('class', 'navigationBarTitle');
  navigationAccount .setAttribute('class', 'navigationBarAccount');
  accountBlock      .setAttribute('class', 'navigationBarAccountBlock');
  accountBlockData  .setAttribute('class', 'navigationBarAccountBlockData');
  accountMenu       .setAttribute('class', 'navigationBarAccountBlockMenu');
  accountMenuList   .setAttribute('class', 'navigationBarAccountBlockMenuList');

  accountBlock      .setAttribute('id', 'headerBlockNavigationAccountBlock');
  accountMenu       .setAttribute('id', 'headerBlockNavigationAccountBlockMenu');

  accountBlock      .addEventListener('mouseenter', () => accountMenu.style.display = 'block');
  accountBlock      .addEventListener('mouseleave', () => accountMenu.removeAttribute('style'));

  //To uncomment when load location is implemented
  //navigationTitle   .addEventListener('click', () => loadLocation('home'));

  navigationTitle   .innerHTML += `<div class="navigationBarTitleName">${appStrings.appName.replace('$[1]', '<span>').replace('$[2]', '</span>')}</div>`;

  accountBlockData  .innerHTML += `<div id="navigationBarAccountEmail" class="navigationBarAccountBlockDataEmail">${accountData.email}</div>`;
  accountBlockData  .innerHTML += `<div class="navigationBarAccountBlockDataCircle"><img id="navigationBarAccountPicture" class="navigationBarAccountBlockDataPicture" alt="" src="${accountData.picture}" /></div>`;

  //accountMenuList   .innerHTML += `<li onclick="loadLocation('account')" class="navigationBarAccountBlockMenuListElement">${commonStrings.root.navigationBar.accountMenu.account}</li>`;
  accountMenuList   .innerHTML += `<li onclick="logoutOpenPrompt()" class="navigationBarAccountBlockMenuListElement">${commonStrings.root.navigationBar.accountMenu.logout}</li>`;

  accountMenu       .appendChild(accountMenuList);
  accountBlock      .appendChild(accountBlockData);
  accountBlock      .appendChild(accountMenu);
  navigationAccount .appendChild(accountBlock);

  navigationBar     .appendChild(navigationTitle);
  navigationBar     .appendChild(navigationAccount);

  header            .appendChild(navigationBar);

  document.getElementById('mainContainer').appendChild(header);

  return createContainers(callback);
}

/****************************************************************************************************/
