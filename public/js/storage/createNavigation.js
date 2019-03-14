/****************************************************************************************************/

function createNavigation(callback)
{
  var navigationBar     = document.createElement('nav');
  var barContent        = document.createElement('div');
  var contentName       = document.createElement('div');
  var contentMenu       = document.createElement('div');
  var barAccount        = document.createElement('div');
  var accountBlock      = document.createElement('div');
  var accountBlockData  = document.createElement('div');
  var accountMenu       = document.createElement('div');
  var accountMenuList   = document.createElement('ul');

  contentMenu           .setAttribute('id', 'navigationBarMenu');

  navigationBar         .setAttribute('class', 'navigationBar');
  barContent            .setAttribute('class', 'navigationBarContent');
  contentName           .setAttribute('class', 'navigationBarContentName');
  contentMenu           .setAttribute('class', 'navigationBarContentMenu');
  barAccount            .setAttribute('class', 'navigationBarAccount');
  accountBlock          .setAttribute('class', 'navigationBarAccountBlock');
  accountBlockData      .setAttribute('class', 'navigationBarAccountBlockData');
  accountMenu           .setAttribute('class', 'navigationBarAccountMenu');
  accountMenuList       .setAttribute('class', 'navigationBarAccountMenuList');

  contentName           .innerHTML += `${storageStrings.navigationBar.appName.split(' ')[0]} ${storageStrings.navigationBar.appName.split(' ')[1]} <span>${storageStrings.navigationBar.appName.split(' ')[2]}</span>`;
  contentMenu           .innerHTML += `<div onclick="loadLocation('home')" name="home" class="navigationBarContentMenuElement">${storageStrings.navigationBar.menu.services}</div>`;
  contentMenu           .innerHTML += `<div onclick="loadLocation('admin')" name="admin" class="navigationBarContentMenuElement">${storageStrings.navigationBar.menu.admin}</div>`;
  contentMenu           .innerHTML += `<div onclick="exitApp()" class="navigationBarContentMenuElement">${storageStrings.navigationBar.menu.exit}</div>`;

  accountBlockData      .innerHTML += `<div class="navigationBarAccountBlockDataEmail">${accountData.email}</div>`;
  accountBlockData      .innerHTML += `<div class="navigationBarAccountBlockDataPicture"><img src="${accountData.picture}" alt="" /></div>`;

  accountMenuList       .innerHTML += `<li onclick="linkToAccount()" class="navigationBarAccountMenuListElement">${storageStrings.navigationBar.accountMenu.account}</li>`;
  accountMenuList       .innerHTML += `<li onclick="logoutOpenPrompt()" class="navigationBarAccountMenuListElement">${storageStrings.navigationBar.accountMenu.logout}</li>`;

  accountBlock          .addEventListener('mouseenter', () => accountMenu.style.display = 'block');
  accountBlock          .addEventListener('mouseleave', () => accountMenu.removeAttribute('style'));

  barContent            .appendChild(contentName);
  barContent            .appendChild(contentMenu);

  accountMenu           .appendChild(accountMenuList);

  accountBlock          .appendChild(accountBlockData);
  accountBlock          .appendChild(accountMenu);

  barAccount            .appendChild(accountBlock);

  navigationBar         .appendChild(barContent);
  navigationBar         .appendChild(barAccount);

  document.getElementById('wrapperContainer').appendChild(navigationBar);

  return createMessenger(callback);
}

/****************************************************************************************************/
