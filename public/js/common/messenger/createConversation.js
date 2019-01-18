/****************************************************************************************************/
/* Create A New Conversation */
/****************************************************************************************************/

function createNewConversation()
{
  if(commonStrings == null) return;

  if(document.getElementById('messengerCreateConversation') == null) return displayMessengerError(commonStrings.messenger.genericErrorMessage, true);

  if(document.getElementById('messengerCreateConversationAccounts')) document.getElementById('messengerCreateConversationAccounts').remove();

  displayMessengerLoader(commonStrings.messenger.startNewConversation.retrieveAccountsLoaderMessage, (loader) =>
  {
    createNewConversationGetAccountsFromServer(loader);
  });
}

/****************************************************************************************************/

function createNewConversationGetAccountsFromServer(loader)
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', timeout: 10000, url: '/api/messenger/get-accounts-with-whom-to-start-a-conversation',

    error: (xhr, textStatus, errorThrown) =>
    {
      loader.remove();

      xhr.responseJSON != undefined
      ? displayMessengerError(xhr.responseJSON.message, true)
      : displayMessengerError(commonStrings.messenger.genericErrorMessage, true);
    }

  }).done((result) =>
  {
    loader.remove();

    if(result.accounts.length === 0) return displayMessengerInfo(commonStrings.messenger.startNewConversation.noAccounts);

    document.getElementById('messengerHome').style.display = 'none';
    document.getElementById('messengerCreateConversation').style.display = 'block';

    var list  = document.createElement('ul');

    list      .setAttribute('id', 'messengerCreateConversationAccounts');
    list      .setAttribute('class', 'messengerCreateConversationAccounts');

    for(var x = 0; x < result.accounts.length; x++) list.innerHTML += `<li onclick="createNewConversationSelectAccount('${result.accounts[x].uuid}')" class="messengerCreateConversationAccountsElement"><div class="messengerCreateConversationAccountsElementCircle"><img class="messengerCreateConversationAccountsElementPicture" src="${result.accounts[x].picture}" /></div><div class="messengerCreateConversationAccountsElementName">${result.accounts[x].firstname.charAt(0).toUpperCase()}${result.accounts[x].firstname.slice(1).toLowerCase()} ${result.accounts[x].lastname.charAt(0).toUpperCase()}${result.accounts[x].lastname.slice(1).toLowerCase()}</div></li>`;

    document.getElementById('messengerCreateConversationPickAccount').appendChild(list);
  });
}

/****************************************************************************************************/
/* Display Accounts Whose Name Includes Searched Value */
/****************************************************************************************************/

function createNewConversationSearchAccounts()
{
  if(commonStrings == null) return;

  if(document.getElementById('messengerCreateConversationAccounts') == null) return event.target.value = '';

  const currentAccounts = document.getElementById('messengerCreateConversationAccounts').children;

  for(var x = 0; x < currentAccounts.length; x++)
  {
    currentAccounts[x].children[1].innerText.toLowerCase().includes(event.target.value.toLowerCase())
    ? currentAccounts[x].removeAttribute('style')
    : currentAccounts[x].style.display = 'none';
  }
}

/****************************************************************************************************/
/* When Selecting An Account Whom Send A Message To */
/****************************************************************************************************/

function createNewConversationSelectAccount(accountUuid)
{
  var target = event.target;

  while(target.nodeName !== 'LI') target = target.parentNode;

  const accountName = target.children[1].innerText;

  document.getElementById('messengerCreateConversationPickAccount').style.display = 'none';

  var block = document.createElement('div');

  block     .setAttribute('id', 'messengerCreateConversationFirstMessage');
  block     .setAttribute('class', 'messengerCreateConversationFirstMessage');

  block     .innerHTML += `<button onclick="createNewConversationReturnToAccountsList()" class="messengerCreateConversationFirstMessageCancel">${commonStrings.messenger.startNewConversation.returnButton}</button>`;
  block     .innerHTML += `<div class="messengerCreateConversationFirstMessageHeader"><div class="messengerCreateConversationFirstMessageHeaderLabel">${commonStrings.messenger.startNewConversation.accountToStartConversationWith} :</div><div class="messengerCreateConversationFirstMessageHeaderValue">${accountName}</div></div>`;
  block     .innerHTML += `<div id="messengerCreateConversationFirstMessageInput" class="messengerCreateConversationFirstMessageInput" contenteditable="true"></div>`;
  block     .innerHTML += `<button onclick="createNewConversationSendNewMessageToServer('${accountUuid}')" class="messengerCreateConversationFirstMessageSend">${commonStrings.messenger.startNewConversation.sendButton}</button>`;

  document.getElementById('messengerCreateConversation').appendChild(block);
}

/****************************************************************************************************/
/* Send The New Message To The Server */
/****************************************************************************************************/

function createNewConversationSendNewMessageToServer(accountUuid)
{
  if(commonStrings == null) return;

  const messageToSend = document.getElementById('messengerCreateConversationFirstMessageInput').innerText;

  if(new RegExp('^[\\S]+([\\s]*[\\S]*)*$').test(messageToSend) == false) return displayMessengerError(commonStrings.messenger.startNewConversation.emptyMessageError, true);

  displayMessengerLoader(commonStrings.messenger.startNewConversation.sendingMessageLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', data: { messageData: JSON.stringify({ conversationUuid: null, messageContent: messageToSend, participants: [ accountUuid ] }) }, timeout: 10000, url: '/api/messenger/post-message',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        loader.remove();
  
        xhr.responseJSON != undefined
        ? displayMessengerError(xhr.responseJSON.message, true)
        : displayMessengerError(commonStrings.messenger.genericErrorMessage, true);
      }
  
    }).done((result) =>
    {
      loader.remove();

      document.getElementById('messengerCreateConversationFirstMessage').remove();

      document.getElementById('messengerHome').removeAttribute('style');
      document.getElementById('messengerCreateConversation').removeAttribute('style');

      displayMessengerInfo(result.message);
    });
  });
}

/****************************************************************************************************/

function createNewConversationReturnToAccountsList()
{
  if(commonStrings == null) return;

  if(document.getElementById('messengerCreateConversationFirstMessage')) document.getElementById('messengerCreateConversationFirstMessage').remove();

  document.getElementById('messengerCreateConversationPickAccount').removeAttribute('style');
}

/****************************************************************************************************/

function cancelNewConversation()
{
  if(commonStrings == null) return;
  
  document.getElementById('messengerHome').removeAttribute('style');
  document.getElementById('messengerCreateConversation').removeAttribute('style');

  if(document.getElementById('messengerCreateConversationSearch')) document.getElementById('messengerCreateConversationSearch').value = '';
}

/****************************************************************************************************/