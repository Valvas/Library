/****************************************************************************************************/

let createConversationStatusInterval = null;

/****************************************************************************************************/

function createNewConversationSearchForAccounts()
{
  const searchedValue = event.target.value.toLowerCase().trim();

  const accountsList = document.getElementById('messengerCreateBlockList').children;

  if(accountsList.length === 0) return;

  document.getElementById('messengerCreateBlockEmptySearch').removeAttribute('style');

  var counter = 0;

  for(var x = 0; x < accountsList.length; x++)
  {
    if(accountsList[x].children[1].innerText.toLowerCase().includes(searchedValue))
    {
      counter += 1;
      accountsList[x].removeAttribute('style');
      continue;
    }

    accountsList[x].style.display = 'none';
  }

  if(counter === 0) document.getElementById('messengerCreateBlockEmptySearch').style.display = 'block';
}

/****************************************************************************************************/

function createNewConversationOpenAccountsList()
{
  document.getElementById('messengerBlockHome').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'messengerLoaderVerticalContainer');
  loader      .innerHTML = '<div class="messengerLoaderHorizontalContainer"><div class="messengerLoaderSpinner"></div></div>';

  document.getElementById('messengerBlockHidden').appendChild(loader);

  $.ajax(
  {
    method: 'GET', timeout: 10000, dataType: 'JSON', url: '/api/messenger/get-accounts-with-whom-to-start-a-conversation', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('messengerBlockHome').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createNewConversationError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'createNewConversationError');
    }

  }).done((result) =>
  {
    const accounts = result.accountsList;

    var createBlock   = document.createElement('div');
    var blockHeader   = document.createElement('div');
    var headerReturn  = document.createElement('div');
    var returnButton  = document.createElement('button');
    var headerSearch  = document.createElement('div');
    var headerInfo    = document.createElement('div');
    var blockList     = document.createElement('div');
    var emptyAccounts = document.createElement('div');
    var emptySearch   = document.createElement('div');

    createBlock       .setAttribute('id', 'messengerCreateBlock');
    emptySearch       .setAttribute('id', 'messengerCreateBlockEmptySearch');
    blockList         .setAttribute('id', 'messengerCreateBlockList');

    createBlock       .setAttribute('class', 'messengerCreateBlock');
    blockHeader       .setAttribute('class', 'messengerCreateBlockHeader');
    headerReturn      .setAttribute('class', 'messengerCreateBlockHeaderReturn');
    headerInfo        .setAttribute('class', 'messengerCreateBlockHeaderInfo');
    headerSearch      .setAttribute('class', 'messengerCreateBlockHeaderSearch');
    emptyAccounts     .setAttribute('class', 'messengerCreateBlockEmptyAccounts');
    emptySearch       .setAttribute('class', 'messengerCreateBlockEmptySearch');
    blockList         .setAttribute('class', 'messengerCreateBlockList');

    headerSearch      .innerHTML = `<input oninput="createNewConversationSearchForAccounts()" type="text" placeholder="${commonStrings.messenger.searchInputPlaceholder}" />`;

    returnButton      .innerText = commonStrings.messenger.startNewConversation.returnButton;
    headerInfo        .innerText = commonStrings.messenger.startNewConversation.informationMessage;
    emptyAccounts     .innerText = commonStrings.messenger.startNewConversation.noAccounts;
    emptySearch       .innerText = commonStrings.messenger.startNewConversation.emptySearchResults;

    if(accounts.length === 0) emptyAccounts.style.display = 'block';

    for(var x = 0; x < accounts.length; x++)
    {
      const currentAccountData = accounts[x];

      var currentAccount  = document.createElement('div');
      var accountPicture  = document.createElement('div');
      var accountName     = document.createElement('div');
      var accountStatus   = document.createElement('span');

      currentAccount      .setAttribute('name', currentAccountData.uuid);

      currentAccount      .setAttribute('class', 'messengerCreateBlockListAccount');
      accountPicture      .setAttribute('class', 'messengerCreateBlockListAccountPicture');
      accountName         .setAttribute('class', 'messengerCreateBlockListAccountName');
      accountStatus       .setAttribute('class', 'offline');

      accountPicture      .innerHTML = `<img src="${accounts[x].picture}" alt="" />`;

      accountName         .innerText = `${accounts[x].firstname.charAt(0).toUpperCase()}${accounts[x].firstname.slice(1).toLowerCase()} ${accounts[x].lastname.charAt(0).toUpperCase()}${accounts[x].lastname.slice(1).toLowerCase()}`;

      currentAccount      .addEventListener('click', () =>
      {
        createNewConversationAccountChosen(currentAccountData);
      });

      currentAccount      .appendChild(accountPicture);
      currentAccount      .appendChild(accountName);
      currentAccount      .appendChild(accountStatus);
      blockList           .appendChild(currentAccount);
    }

    returnButton      .addEventListener('click', () =>
    {
      if(createConversationStatusInterval !== null)
      {
        clearInterval(createConversationStatusInterval);
      }

      createBlock     .remove();

      document.getElementById('messengerBlockHome').removeAttribute('style');
    });

    headerReturn      .appendChild(returnButton);
    blockHeader       .appendChild(headerReturn);
    blockHeader       .appendChild(headerInfo);
    blockHeader       .appendChild(headerSearch);
    createBlock       .appendChild(blockHeader);
    createBlock       .appendChild(emptyAccounts);
    createBlock       .appendChild(emptySearch);
    createBlock       .appendChild(blockList);

    loader            .remove();

    createConversationUpdateAccountStatus();

    createConversationStatusInterval = setInterval(() =>
    {
      createConversationUpdateAccountStatus();
    }, 2000);

    document.getElementById('messengerBlockHidden').appendChild(createBlock);
  });
}

/****************************************************************************************************/

function createNewConversationAccountChosen(selectedAccountData)
{
  document.getElementById('messengerCreateBlock').style.display = 'none';

  var createBlock     = document.createElement('div');
  var blockHeader     = document.createElement('div');
  var headerTop       = document.createElement('div');
  var topMessage      = document.createElement('div');
  var topReturn       = document.createElement('button');
  var headerAccount   = document.createElement('div');
  var accountPicture  = document.createElement('div');
  var accountName     = document.createElement('div');
  var blockForm       = document.createElement('form');
  var formInput       = document.createElement('textarea');
  var formSend        = document.createElement('button');

  createBlock         .setAttribute('id', 'messengerCreateAccountChosenBlock');

  blockForm           .setAttribute('name', selectedAccountData.uuid);

  createBlock         .setAttribute('class', 'messengerCreateAccountChosenBlock');
  blockHeader         .setAttribute('class', 'messengerCreateAccountChosenBlockHeader');
  headerTop           .setAttribute('class', 'messengerCreateAccountChosenBlockHeaderTop');
  topMessage          .setAttribute('class', 'messengerCreateAccountChosenBlockHeaderTopMessage');
  topReturn           .setAttribute('class', 'messengerCreateAccountChosenBlockHeaderTopReturn');
  headerAccount       .setAttribute('class', 'messengerCreateAccountChosenBlockHeaderAccount');
  accountPicture      .setAttribute('class', 'messengerCreateAccountChosenBlockHeaderAccountPicture');
  accountName         .setAttribute('class', 'messengerCreateAccountChosenBlockHeaderAccountName');
  blockForm           .setAttribute('class', 'messengerCreateAccountChosenBlockForm');
  formInput           .setAttribute('class', 'messengerCreateAccountChosenBlockFormInput');
  formSend            .setAttribute('class', 'messengerCreateAccountChosenBlockFormSend');

  topMessage          .innerText = `${commonStrings.messenger.startNewConversation.accountToStartConversationWith} :`;
  topReturn           .innerText = commonStrings.messenger.startNewConversation.returnButton;
  accountName         .innerText = `${selectedAccountData.firstname.charAt(0).toUpperCase()}${selectedAccountData.firstname.slice(1).toLowerCase()} ${selectedAccountData.lastname.charAt(0).toUpperCase()}${selectedAccountData.lastname.slice(1).toLowerCase()}`;
  formSend            .innerText = commonStrings.messenger.startNewConversation.sendButton;

  accountPicture      .innerHTML = `<img src="${selectedAccountData.picture}" alt="" />`;

  formInput           .setAttribute('placeholder', commonStrings.messenger.conversationBlock.textareaPlaceholder);
  formInput           .setAttribute('name', 'message');

  topReturn           .addEventListener('click', () =>
  {
    createBlock.remove();
    document.getElementById('messengerCreateBlock').removeAttribute('style');
  });

  blockForm           .addEventListener('submit', createNewConversationOpenPrompt);

  headerTop           .appendChild(topMessage);
  headerTop           .appendChild(topReturn);
  headerAccount       .appendChild(accountPicture);
  headerAccount       .appendChild(accountName);
  blockHeader         .appendChild(headerTop);
  blockHeader         .appendChild(headerAccount);
  blockForm           .appendChild(formInput);
  blockForm           .appendChild(formSend);
  createBlock         .appendChild(blockHeader);
  createBlock         .appendChild(blockForm);

  document.getElementById('messengerBlockHidden').appendChild(createBlock);
}

/****************************************************************************************************/

function createNewConversationOpenPrompt(event)
{
  event.preventDefault();

  const messageToSend = event.target.elements['message'].value.trim();
  const receiverUuid = event.target.getAttribute('name');

  if(messageToSend.length === 0) return;

  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  var veilBackground        = document.createElement('div');
  var verticalBackground    = document.createElement('div');
  var horizontalBackground  = document.createElement('div');
  var modal                 = document.createElement('div');
  var modalHeader           = document.createElement('div');
  var modalHeaderTitle      = document.createElement('div');
  var modalContent          = document.createElement('div');
  var modalContentButtons   = document.createElement('div');
  var modalContentConfirm   = document.createElement('button');
  var modalContentCancel    = document.createElement('button');

  veilBackground        .setAttribute('id', 'veilBackground');
  verticalBackground    .setAttribute('id', 'modalBackground');

  veilBackground        .setAttribute('class', 'veilBackground');
  verticalBackground    .setAttribute('class', 'modalBackgroundVertical');
  horizontalBackground  .setAttribute('class', 'modalBackgroundHorizontal');
  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalContent          .setAttribute('class', 'baseModalContent');
  modalContentButtons   .setAttribute('class', 'baseModalContentButtons');
  modalContentConfirm   .setAttribute('class', 'baseModalContentButtonsConfirm');
  modalContentCancel    .setAttribute('class', 'baseModalContentButtonsCancel');

  modalHeaderTitle      .innerText = commonStrings.messenger.startNewConversation.prompt.title;
  modalContentConfirm   .innerText = commonStrings.messenger.startNewConversation.prompt.confirm;
  modalContentCancel    .innerText = commonStrings.messenger.startNewConversation.prompt.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${commonStrings.messenger.startNewConversation.prompt.message}</div>`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalContent          .appendChild(modalContentButtons);
  modalContentButtons   .appendChild(modalContentConfirm);
  modalContentButtons   .appendChild(modalContentCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalContentConfirm   .addEventListener('click', () =>
  {
    createNewConversationSendToServer(messageToSend, receiverUuid);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    checkMessageTag('startMessengerConversationError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function createNewConversationSendToServer(messageToSend, receiverUuid)
{
  document.getElementById('veilBackground').remove();
  document.getElementById('modalBackground').remove();

  document.getElementById('mainContainer').removeAttribute('style');

  document.getElementById('messengerCreateAccountChosenBlock').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'messengerLoaderVerticalContainer');
  loader      .innerHTML = '<div class="messengerLoaderHorizontalContainer"><div class="messengerLoaderSpinner"></div></div>';

  document.getElementById('messengerBlockHidden').appendChild(loader);

  $.ajax(
  {
    method: 'POST', timeout: 10000, dataType: 'JSON', data: { receiverUuid: receiverUuid, messageContent: messageToSend }, url: '/api/messenger/create-conversation', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('messengerCreateAccountChosenBlock').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'startMessengerConversationError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'startMessengerConversationError');
    }

  }).done((result) =>
  {
    loader.remove();

    if(createConversationStatusInterval !== null)
    {
      clearInterval(createConversationStatusInterval);
    }

    document.getElementById('messengerCreateBlock').remove();
    document.getElementById('messengerCreateAccountChosenBlock').remove();

    var createSuccess   = document.createElement('div');
    var successMessage  = document.createElement('div');
    var successClose    = document.createElement('div');

    createSuccess       .setAttribute('class', 'messengerCreateSuccess');
    successMessage      .setAttribute('class', 'messengerCreateSuccessMessage');
    successClose        .setAttribute('class', 'messengerCreateSuccessClose');

    successMessage      .innerText = result.message;
    successClose        .innerHTML = `<button>${commonStrings.messenger.closeButton}</button>`;

    successClose        .addEventListener('click', () =>
    {
      createSuccess.remove();
      document.getElementById('messengerBlockHome').removeAttribute('style');
    });

    createSuccess       .appendChild(successMessage);
    createSuccess       .appendChild(successClose);

    document.getElementById('messengerBlockHidden').appendChild(createSuccess);
  });
}

/****************************************************************************************************/

function createConversationUpdateAccountStatus()
{
  socket.emit('getUsersStatusOnMessenger', (result) =>
  {
    let connectedUsers = result;

    const accountsList = document.getElementById('messengerCreateBlockList').children;

    for(let x = 0; x < accountsList.length; x++)
    {
      if(connectedUsers[accountsList[x].getAttribute('name')] === undefined)
      {
        accountsList[x].children[2].setAttribute('class', 'offline');
      }

      else
      {
        switch(connectedUsers[accountsList[x].getAttribute('name')])
        {
          case 'available':
            accountsList[x].children[2].setAttribute('class', 'online');
            break;

          case 'busy':
            accountsList[x].children[2].setAttribute('class', 'busy');
            break;

          case 'away':
            accountsList[x].children[2].setAttribute('class', 'away');
            break;
        }
      }
    }
  });
}

/****************************************************************************************************/
