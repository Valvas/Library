/****************************************************************************************************/

function loadAccountSection()
{
  displayLocationLoader();

  history.pushState(null, null, '/account');

  var accountContainer    = document.createElement('div');
  var accountHeader       = document.createElement('div');
  var accountPicture      = document.createElement('div');
  var accountSectionData  = document.createElement('div');
  var accountEmail        = document.createElement('div');
  var accountLastname     = document.createElement('div');
  var accountFirstname    = document.createElement('div');
  var accountNumber       = document.createElement('div');

  accountContainer        .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.account}</div>`;

  accountContainer        .setAttribute('class', 'accountSectionBlock');
  accountHeader           .setAttribute('class', 'accountSectionBlockHeader');
  accountPicture          .setAttribute('class', 'accountSectionBlockHeaderPicture');
  accountSectionData      .setAttribute('class', 'accountSectionData');
  accountEmail            .setAttribute('class', 'accountSectionDataBlock');
  accountLastname         .setAttribute('class', 'accountSectionDataBlock');
  accountFirstname        .setAttribute('class', 'accountSectionDataBlock');
  accountNumber           .setAttribute('class', 'accountSectionDataBlock');

  accountEmail            .innerHTML = `<div id="accountCurrentEmail" class="accountSectionDataBlockValue">${accountData.email}</div><button onclick="updateEmailOpenPopup()" class="accountSectionDataBlockUpdate">${commonStrings.root.account.emailBlockUpdate}</button>`;
  accountLastname         .innerHTML = `<div id="accountCurrentLastname" class="accountSectionDataBlockValue">${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}</div><button onclick="updateLastnameOpenPopup()" class="accountSectionDataBlockUpdate">${commonStrings.root.account.lastnameBlockUpdate}</button>`;
  accountFirstname        .innerHTML = `<div id="accountCurrentFirstname" class="accountSectionDataBlockValue">${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()}</div><button onclick="updateFirstnameOpenPopup()" class="accountSectionDataBlockUpdate">${commonStrings.root.account.firstnameBlockUpdate}</button>`;
  accountNumber           .innerHTML = `<div id="accountCurrentContactNumber" class="accountSectionDataBlockValue">+${accountData.contactNumber}</div><button onclick="updateContactNumberOpenPopup()" class="accountSectionDataBlockUpdate">${commonStrings.root.account.contactNumberBlockUpdate}</button>`;

  accountPicture          .innerHTML += `<div class="accountSectionBlockHeaderPictureCircle"><img class="accountSectionBlockHeaderPictureContent" id="accountCurrentPicture" src="${accountData.picture}" /></div>`;

  accountHeader           .appendChild(accountPicture);

  accountHeader           .innerHTML += `<button onclick="updatePictureOpenPopup()" class="accountSectionBlockHeaderUpdate">${commonStrings.root.account.accountPictureBlockUpdate}</button>`;

  accountSectionData      .appendChild(accountEmail);
  accountSectionData      .appendChild(accountLastname);
  accountSectionData      .appendChild(accountFirstname);
  accountSectionData      .appendChild(accountNumber);

  accountContainer        .appendChild(accountHeader);
  accountContainer        .appendChild(accountSectionData);

  accountContainer        .innerHTML += `<div class="accountSectionPassword"><button onclick="updatePasswordOpenPopup()" class="accountSectionPasswordButton">${commonStrings.root.account.passwordBlockUpdate}</button></div>`;

  accountContainer        .style.display = 'none';

  document.getElementById('locationContent').appendChild(accountContainer);

  if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

  $(accountContainer).fadeIn(250);
}

/****************************************************************************************************/
