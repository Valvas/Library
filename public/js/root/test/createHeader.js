/****************************************************************************************************/

function createHeader(callback)
{
  var header                = document.createElement('div');
  var navigationBar         = document.createElement('div');
  var navigationTitle       = document.createElement('div');
  var navigationAccount     = document.createElement('div');
  var accountBlock          = document.createElement('div');
  var accountBlockData      = document.createElement('div');
  var accountMenu           = document.createElement('div');
  var accountMenuList       = document.createElement('ul');

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

  navigationTitle   .innerHTML += `<div class="navigationBarTitleCompanyName">${commonStrings.root.navigationBar.companyName}</div>`;
  navigationTitle   .innerHTML += `<div class="navigationBarTitleAppName">${commonStrings.root.navigationBar.appName}</div>`;

  accountBlockData  .innerHTML += `<div class="navigationBarAccountBlockDataEmail">${accountData.email}</div>`;
  accountBlockData  .innerHTML += `<div class="navigationBarAccountBlockDataCircle"><img id="headerBlockNavigationAccountBlockPicture" class="navigationBarAccountBlockDataPicture" src="${accountData.picture}" /></div>`;

  accountMenuList   .innerHTML += `<li class="navigationBarAccountBlockMenuListElement">${commonStrings.root.navigationBar.accountMenu.account}</li>`;
  accountMenuList   .innerHTML += `<li class="navigationBarAccountBlockMenuListElement">${commonStrings.root.navigationBar.accountMenu.logout}</li>`;

  accountMenu       .appendChild(accountMenuList);
  accountBlock      .appendChild(accountBlockData);
  accountBlock      .appendChild(accountMenu);
  navigationAccount .appendChild(accountBlock);

  navigationBar     .appendChild(navigationTitle);
  navigationBar     .appendChild(navigationAccount);

  header            .appendChild(navigationBar);

  document.getElementById('mainContainer').appendChild(header);

  return createContainer(callback);
}

/****************************************************************************************************/
