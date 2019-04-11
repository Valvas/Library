/****************************************************************************************************/

function loadAccountSection()
{
  displayLocationLoader();

  history.pushState(null, null, '/account');

  const accountContainer    = document.createElement('div');
  const accountHeader       = document.createElement('div');
  const accountPicture      = document.createElement('div');
  const accountSectionData  = document.createElement('div');
  const accountEmail        = document.createElement('div');
  const accountLastname     = document.createElement('div');
  const accountFirstname    = document.createElement('div');
  const accountNumber       = document.createElement('div');

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

  accountNumber           .innerHTML = accountData.contactNumber == null
  ? `<div id="accountCurrentContactNumber" class="accountSectionDataBlockValue">${commonStrings.root.account.noContactNumber}</div><button onclick="updateContactNumberOpenPopup()" class="accountSectionDataBlockUpdate">${commonStrings.root.account.contactNumberBlockUpdate}</button>`
  : `<div id="accountCurrentContactNumber" class="accountSectionDataBlockValue">+${accountData.contactNumber}</div><button onclick="updateContactNumberOpenPopup()" class="accountSectionDataBlockUpdate">${commonStrings.root.account.contactNumberBlockUpdate}</button>`;

  accountPicture          .innerHTML += `<div class="accountSectionBlockHeaderPictureCircle"><img class="accountSectionBlockHeaderPictureContent" id="accountCurrentPicture" alt="" src="${accountData.picture}" /></div>`;

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

  $(document.getElementById('locationLoaderVerticalBlock')).fadeOut(250, () =>
  {
    document.getElementById('locationLoaderVerticalBlock').remove();

    $(accountContainer).fadeIn(250);
  });
}

/****************************************************************************************************/
