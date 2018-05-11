/****************************************************************************************************/

var xhr = new XMLHttpRequest();
var intervalFunction = null;

/****************************************************************************************************/

function showServicesBlocks()
{
  if(!(document.getElementById('rightsOnServicesHomeServicesMembers')))
  {
    document.getElementById('rightsOnServicesHomeServicesBlock').removeAttribute('style');

    var blocks = document.getElementById('rightsOnServicesHomeServicesBlock').children;

    var expirationTime = parseInt(1000 / blocks.length, 10);

    var y = 0;

    var showAllBlocksLoop = () =>
    {
      $(blocks[y]).toggle('slide', 'left', expirationTime, () =>
      {
        if((y += 1) < blocks.length) showAllBlocksLoop();
      });
    }

    showAllBlocksLoop();
  }
}

/****************************************************************************************************/

function hideServicesBlocks(serviceName)
{
  if(!(document.getElementById('rightsOnServicesHomeServicesMembers')))
  {
    var blocks = document.getElementById('rightsOnServicesHomeServicesBlock').children;

    var expirationTime = parseInt(1000 / blocks.length, 10);

    var x = blocks.length - 1;

    var hideAllBlocksLoop = () =>
    {
      $(blocks[x]).toggle('slide', 'left', expirationTime, () =>
      {
        if((x -= 1) >= 0)hideAllBlocksLoop()
        
        else
        {
          document.getElementById('rightsOnServicesHomeServicesBlock').style.display = 'none';
          createServiceDetail(serviceName);
        }
      });
    }

    hideAllBlocksLoop();
  }
}

/****************************************************************************************************/

function createServiceDetail(serviceName)
{
  displayLoadingPopup(() =>
  {
    intervalFunction = setInterval(() => { modifyLoadingMessage(null); }, 250);

    xhr = $.ajax(
    {
      type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/storage/strings', success: () => {},
      error: (xhr, status, error) =>
      {
        clearInterval(intervalFunction);
        intervalFunction = null;

        if(xhr.responseJSON == undefined)
        {
          displayLoadingPopupError('La requête a expiré, veuillez réessayer plus tard', null);
        }
  
        else
        {
          displayLoadingPopupError(xhr.responseJSON.message, xhr.responseJSON.detail);
        }
      }
    }).done((json) =>
    {
      const strings = json.strings;

      clearInterval(intervalFunction);
      intervalFunction = null;

      intervalFunction = setInterval(() => { modifyLoadingMessage(strings.admin.servicesRights.loadingPopup.message); }, 250);

      document.getElementById('rightsOnServicesHomeLoadingPopupTitle').innerText = strings.admin.servicesRights.loadingPopup.title;
      document.getElementById('rightsOnServicesHomeLoadingPopupMessage').innerText = strings.admin.servicesRights.loadingPopup.message + '.';

      xhr = $.ajax(
      {
        type: 'POST', timeout: 10000, dataType: 'JSON', data: { serviceName: serviceName }, url: '/queries/storage/admin/get-service-members', success: () => {},
        error: (xhr, status, error) =>
        {
          clearInterval(intervalFunction);
          intervalFunction = null;

          if(xhr.responseJSON == undefined)
          {
            displayLoadingPopupError('La requête a expiré, veuillez réessayer plus tard', null);
          }
    
          else
          {
            displayLoadingPopupError(xhr.responseJSON.message, xhr.responseJSON.detail);
          }
        }
      }).done((json) =>
      {
        createMembersBlock(json.accounts, json.members, json.rights, strings, serviceName, () =>
        {
          createPagesList(Object.keys(json.members).length, () =>
          {
            createAccountListBlock(json.accounts, json.members, strings, () =>
            {
              closeLoadingPopup(false);
            });              
          });
        });
      });
    });
  });
}

/****************************************************************************************************/

function displayLoadingPopup(callback)
{
  var background      = document.createElement('div');
  var popup           = document.createElement('div');
  var title           = document.createElement('div');
  var content         = document.createElement('div');
  var message         = document.createElement('div');
  var spinner         = document.createElement('div');

  background          .setAttribute('id', 'rightsOnServicesHomeLoadingBackground');
  popup               .setAttribute('id', 'rightsOnServicesHomeLoadingPopup');
  title               .setAttribute('id', 'rightsOnServicesHomeLoadingPopupTitle');
  content             .setAttribute('id', 'rightsOnServicesHomeLoadingContent');
  message             .setAttribute('id', 'rightsOnServicesHomeLoadingPopupMessage');
  spinner             .setAttribute('id', 'rightsOnServicesHomeLoadingPopupSpinner');

  background          .setAttribute('class', 'storageBackground');
  popup               .setAttribute('class', 'storagePopup');
  title               .setAttribute('class', 'storagePopupTitle');
  spinner             .setAttribute('class', 'storagePopupSpinner');
  message             .setAttribute('class', 'storagePopupMessage');

  title               .innerText = '...';
  message             .innerText = '...';
  spinner             .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  popup               .appendChild(title);
  popup               .appendChild(content);
  content             .appendChild(spinner);
  content             .appendChild(message);

  $(background)       .hide().appendTo(document.body);
  $(popup)            .hide().appendTo(document.body);

  popup               .style.left = `-${$(popup).width() + 2}px`;

  $(popup)            .show();

  $(background).slideDown(250, () =>
  {
    var x = popup.clientWidth * (-1);

    var displayPopupInterval = setInterval(() => { displayPopup(); }, 20);

    function displayPopup()
    {
      if((x + 100) > (document.body.clientWidth / 2) - (popup.clientWidth / 2)) x = (document.body.clientWidth / 2) - (popup.clientWidth / 2);

      popup.style.left = `${x}px`;

      if((x += 100) > (document.body.clientWidth / 2) - (popup.clientWidth / 2))
      {
        clearInterval(displayPopupInterval);

        return callback();
      }
    }
  });
}

/****************************************************************************************************/

function closeLoadingPopup(boolean)
{
  if(intervalFunction != null) clearInterval(intervalFunction);

  var x = (document.body.clientWidth / 2) - (($(document.getElementById('rightsOnServicesHomeLoadingPopup')).width() + 2) / 2);

  if(document.getElementById('rightsOnServicesHomeLoadingPopup'))
  {
    var hidePopupInterval = setInterval(() => { hidePopup(); }, 20);

    function hidePopup()
    {
      if((x -= 100) < ($(document.getElementById('rightsOnServicesHomeLoadingPopup')).width() + 2) * (-1)) x = ($(document.getElementById('rightsOnServicesHomeLoadingPopup')).width() + 2) * (-1);

      document.getElementById('rightsOnServicesHomeLoadingPopup').style.left = `${x}px`;

      if((x - 100) < ($(document.getElementById('rightsOnServicesHomeLoadingPopup')).width() + 2) * (-1))
      {
        clearInterval(hidePopupInterval);

        document.getElementById('rightsOnServicesHomeLoadingPopup').remove();

        $(document.getElementById('rightsOnServicesHomeLoadingBackground')).slideUp(250, () =>
        {
          document.getElementById('rightsOnServicesHomeLoadingBackground').remove();

          if(boolean)
          {
            showServicesBlocks();
          }
        });
      }
    }
  }
}

/****************************************************************************************************/

function modifyLoadingMessage(message)
{
  if(message == null)
  {
    document.getElementById('rightsOnServicesHomeLoadingPopupMessage').innerText.length == 9 ?
    document.getElementById('rightsOnServicesHomeLoadingPopupMessage').innerText = '...' :
    document.getElementById('rightsOnServicesHomeLoadingPopupMessage').innerText += '.';
  }

  else
  {
    document.getElementById('rightsOnServicesHomeLoadingPopupMessage').innerText.length == message.length + 3 ?
    document.getElementById('rightsOnServicesHomeLoadingPopupMessage').innerText = message + '.' :
    document.getElementById('rightsOnServicesHomeLoadingPopupMessage').innerText += '.';
  }
}

/****************************************************************************************************/

function displayLoadingPopupError(message, detail)
{
  if(document.getElementById('rightsOnServicesHomeLoadingPopup'))
  {
    var errorBlock          = document.createElement('div');
    var errorBlockMessage   = document.createElement('div');
    var errorBlockDetail    = document.createElement('div');
    var errorBlockClose     = document.createElement('button');

    errorBlockMessage       .innerText = message;
    errorBlockClose         .innerText = 'OK';

    errorBlock              .setAttribute('class', 'storagePopupErrorBlock');
    errorBlockMessage       .setAttribute('class', 'storagePopupErrorBlockMessage');
    errorBlockClose         .setAttribute('class', 'storagePopupErrorBlockClose');

    errorBlockClose         .addEventListener('click', () => { closeLoadingPopup(true); });

    errorBlock              .appendChild(errorBlockMessage);
    errorBlock              .appendChild(errorBlockClose);

    if(detail != null)
    {
      var errorBlockDetail  = document.createElement('div');

      errorBlockDetail      .setAttribute('class', 'storagePopupErrorBlockDetail');

      errorBlockDetail      .innerText = detail;

      errorBlock            .appendChild(errorBlockDetail);
    }

    $(errorBlock)           .hide().appendTo(document.getElementById('rightsOnServicesHomeLoadingPopup'));

    $(document.getElementById('rightsOnServicesHomeLoadingContent')).slideUp(250, () =>
    {
      $(errorBlock).slideDown(250);
    });
  }
}

/****************************************************************************************************/

function createMembersBlock(accounts, members, rights, strings, serviceName, callback)
{
  var membersBlock                      = document.createElement('div');
  var membersBlockTitle                 = document.createElement('div');
  var membersBlockEmpty                 = document.createElement('div');
  var membersBlockHeader                = document.createElement('div');
  var membersBlockList                  = document.createElement('div');
  var membersBlockListLabels            = document.createElement('div');
  var membersBlockListLabelsEmail       = document.createElement('div');
  var membersBlockListLabelsLastname    = document.createElement('div');
  var membersBlockListLabelsFirstname   = document.createElement('div');
  var membersBlockListIcons             = document.createElement('div');
  var membersBlockListIconsComment      = document.createElement('div');
  var membersBlockListIconsUpload       = document.createElement('div');
  var membersBlockListIconsDownload     = document.createElement('div');
  var membersBlockListIconsRemove       = document.createElement('div');
  var membersBlockListAccounts          = document.createElement('div');
  var membersBlockHeaderAdd             = document.createElement('button');
  var membersBlockHeaderClose           = document.createElement('button');

  membersBlock                          .setAttribute('id', 'rightsOnServicesHomeMembersBlock');
  membersBlockEmpty                     .setAttribute('id', 'rightsOnServicesHomeMembersBlockEmpty');
  membersBlockList                      .setAttribute('id', 'rightsOnServicesHomeMembersBlockList');
  membersBlockListAccounts              .setAttribute('id', 'rightsOnServicesHomeMembersBlockListAccounts');

  membersBlock                          .setAttribute('name', serviceName);

  membersBlock                          .setAttribute('class', 'membersBlock');
  membersBlockTitle                     .setAttribute('class', 'membersBlockTitle');
  membersBlockEmpty                     .setAttribute('class', 'membersBlockEmpty');
  membersBlockHeader                    .setAttribute('class', 'membersBlockHeader');
  membersBlockHeaderClose               .setAttribute('class', 'membersBlockHeaderClose');
  membersBlockList                      .setAttribute('class', 'membersBlockList');
  membersBlockListLabels                .setAttribute('class', 'membersBlockListLabels');
  membersBlockListLabelsEmail           .setAttribute('class', 'membersBlockListLabelsEmail');
  membersBlockListLabelsLastname        .setAttribute('class', 'membersBlockListLabelsLastname');
  membersBlockListLabelsFirstname       .setAttribute('class', 'membersBlockListLabelsFirstname');
  membersBlockListIcons                 .setAttribute('class', 'membersBlockListIcons');
  membersBlockListIconsComment          .setAttribute('class', 'membersBlockListIconsElement');
  membersBlockListIconsUpload           .setAttribute('class', 'membersBlockListIconsElement');
  membersBlockListIconsDownload         .setAttribute('class', 'membersBlockListIconsElement');
  membersBlockListIconsRemove           .setAttribute('class', 'membersBlockListIconsElement');
  membersBlockListAccounts              .setAttribute('class', 'membersBlockListAccounts');

  membersBlockHeaderClose               .setAttribute('title', strings.admin.servicesRights.membersBlock.hints.closeMembers);
  membersBlockListIconsComment          .setAttribute('title', strings.admin.servicesRights.membersBlock.hints.commentFiles);
  membersBlockListIconsUpload           .setAttribute('title', strings.admin.servicesRights.membersBlock.hints.uploadFiles);
  membersBlockListIconsDownload         .setAttribute('title', strings.admin.servicesRights.membersBlock.hints.downloadFiles);
  membersBlockListIconsRemove           .setAttribute('title', strings.admin.servicesRights.membersBlock.hints.removeFiles);

  membersBlockHeaderAdd                 .setAttribute('onclick', 'openAccountsBlock()');

  if(rights.add_services_rights == 1) membersBlockHeaderAdd.setAttribute('class', 'membersBlockHeaderAddEnabled');
  if(rights.add_services_rights == 0) membersBlockHeaderAdd.setAttribute('class', 'membersBlockHeaderAddDisabled');

  if(rights.add_services_rights == 1) membersBlockHeaderAdd.setAttribute('title', strings.admin.servicesRights.membersBlock.hints.addMember.true);
  if(rights.add_services_rights == 0) membersBlockHeaderAdd.setAttribute('title', strings.admin.servicesRights.membersBlock.hints.addMember.false);

  membersBlockTitle                     .innerText = strings.admin.servicesRights.membersBlock.title;
  membersBlockEmpty                     .innerText = strings.admin.servicesRights.membersBlock.empty;
  membersBlockHeaderAdd                 .innerText = strings.admin.servicesRights.membersBlock.header.add;
  membersBlockHeaderClose               .innerText = strings.admin.servicesRights.membersBlock.header.close;
  membersBlockListLabelsEmail           .innerText = strings.admin.servicesRights.membersBlock.header.email;
  membersBlockListLabelsLastname        .innerText = strings.admin.servicesRights.membersBlock.header.lastname;
  membersBlockListLabelsFirstname       .innerText = strings.admin.servicesRights.membersBlock.header.firstname;

  membersBlockListIconsComment          .innerHTML = '<i class="fas fa-comment"></i>';
  membersBlockListIconsUpload           .innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
  membersBlockListIconsDownload         .innerHTML = '<i class="fas fa-cloud-download-alt"></i>';
  membersBlockListIconsRemove           .innerHTML = '<i class="fas fa-trash"></i>';

  membersBlockHeaderClose               .addEventListener('click', closeMembersBlock);

  membersBlockListLabels                .appendChild(membersBlockListLabelsEmail);
  membersBlockListLabels                .appendChild(membersBlockListLabelsLastname);
  membersBlockListLabels                .appendChild(membersBlockListLabelsFirstname);
  membersBlockListIcons                 .appendChild(membersBlockListIconsComment);
  membersBlockListIcons                 .appendChild(membersBlockListIconsUpload);
  membersBlockListIcons                 .appendChild(membersBlockListIconsDownload);
  membersBlockListIcons                 .appendChild(membersBlockListIconsRemove);

  membersBlockHeader                    .appendChild(membersBlockHeaderAdd);
  membersBlockHeader                    .appendChild(membersBlockHeaderClose);

  membersBlockList                      .appendChild(membersBlockListLabels);
  membersBlockList                      .appendChild(membersBlockListIcons);
  membersBlockList                      .appendChild(membersBlockListAccounts);

  membersBlock                          .appendChild(membersBlockTitle);
  membersBlock                          .appendChild(membersBlockHeader);
  membersBlock                          .appendChild(membersBlockList);

  $(membersBlockEmpty)                  .hide().appendTo(membersBlockList);
  $(membersBlock)                       .hide().appendTo(document.getElementById('blockToBlur'));

  $(membersBlock).toggle('slide', 'left', 250, () =>
  {
    var x = 0;

    var browseMembers = () =>
    {
      var memberAccount = document.createElement('div');

      memberAccount.setAttribute('tag', Math.floor(x / 10));
      memberAccount.setAttribute('class', 'membersBlockListAccountsElement');

      memberAccount.setAttribute('name', accounts[Object.keys(members)[x]].uuid);

      memberAccount.innerHTML = `<div class="membersBlockListAccountsElementLabels"><div class="membersBlockListAccountsElementLabelsEmail">${accounts[Object.keys(members)[x]].email}</div>`
                              + `<div class="membersBlockListAccountsElementLabelsLastname">${accounts[Object.keys(members)[x]].lastname.toUpperCase()}</div>`
                              + `<div class="membersBlockListAccountsElementLabelsFirstname">${accounts[Object.keys(members)[x]].firstname.charAt(0).toUpperCase() + accounts[Object.keys(members)[x]].firstname.slice(1).toLowerCase()}</div></div>`;

      var memberAccountRights = document.createElement('div');

      memberAccountRights.setAttribute('class', 'membersBlockListAccountsElementRights');

      if(members[Object.keys(members)[x]].post_comments == 1)
      {
        if(rights.remove_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundEnabled"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabledInactive"></div></div></div>'; }
      }

      else
      {
        if(rights.add_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabledInactive"></div></div></div>'; }
      }

      if(members[Object.keys(members)[x]].upload_files == 1)
      {
        if(rights.remove_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundEnabled"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabledInactive"></div></div></div>'; }
      }

      else
      {
        if(rights.add_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabledInactive"></div></div></div>'; }
      }

      if(members[Object.keys(members)[x]].download_files == 1)
      {
        if(rights.remove_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundEnabled"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabledInactive"></div></div></div>'; }
      }

      else
      {
        if(rights.add_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabledInactive"></div></div></div>'; }
      }

      if(members[Object.keys(members)[x]].remove_files == 1)
      {
        if(rights.remove_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundEnabled"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.removeRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleEnabledInactive"></div></div></div>'; }
      }

      else
      {
        if(rights.add_services_rights == 1){ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>'; }
        else{ memberAccountRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabledInactive"></div></div></div>'; }
      }

      memberAccountRights.innerHTML += '<button class="membersBlockListAccountsElementRightsButton" title="' + strings.admin.servicesRights.membersBlock.hints.modifyRights + '"><i class="fas fa-pencil-alt"></i></button>';

      var membersBlockListLabelsRevoke = document.createElement('div');

      if(rights.remove_services_rights == 1)
      {
        membersBlockListLabelsRevoke.setAttribute('class', 'membersBlockListAccountsElementRightsRevokeActive');
        membersBlockListLabelsRevoke.addEventListener('click', removeMemberFromList);
        membersBlockListLabelsRevoke.setAttribute('title', strings.admin.servicesRights.membersBlock.hints.revokeAccess.true);
      }

      if(rights.remove_services_rights == 0)
      {
        membersBlockListLabelsRevoke.setAttribute('class', 'membersBlockListAccountsElementRightsRevokeInactive');
        membersBlockListLabelsRevoke.setAttribute('title', strings.admin.servicesRights.membersBlock.hints.revokeAccess.false);
      }

      membersBlockListLabelsRevoke.innerHTML = '<i class="fas fa-user-times"></i>';

      memberAccountRights.appendChild(membersBlockListLabelsRevoke);

      memberAccount.appendChild(memberAccountRights);

      $(memberAccount).hide().appendTo(membersBlockListAccounts);

      if(x < 10)
      {
        $(memberAccount).toggle('slide', 'left', 50, () =>
        {
          if(members[Object.keys(members)[x += 1]] != undefined) browseMembers();

          else
          {
            callback();
          }
        });
      }

      else
      {
        if(members[Object.keys(members)[x += 1]] != undefined) browseMembers();

        else
        {
          callback();
        }
      }
    }

    if(members[Object.keys(members)[x]] != undefined) browseMembers();

    else
    {
      $(membersBlockEmpty).fadeIn(250, () =>
      {
        callback();
      });
    }
  });
}

/****************************************************************************************************/

function closeMembersBlock()
{
  $(document.getElementById('rightsOnServicesHomeMembersBlock')).toggle('slide', 'left', 250, () =>
  {
    document.getElementById('rightsOnServicesHomeMembersBlock').remove();

    if(document.getElementById('rightsOnServicesHomeAccountsBlock')) document.getElementById('rightsOnServicesHomeAccountsBlock').remove();
    if(document.getElementById('rightsOnServicesHomeAccountsBlockBackground')) document.getElementById('rightsOnServicesHomeAccountsBlockBackground').remove();
    showServicesBlocks();
  });
}

/****************************************************************************************************/

function createPagesList(amountOfMembers, callback)
{
  var endPage = 9, x = 0;

  var pagesBlock            = document.createElement('div');

  pagesBlock                .setAttribute('id', 'rightsOnServicesHomeMembersBlockPages');
  pagesBlock                .setAttribute('class', 'membersBlockListPages');

  var loop = () =>
  {
    var pagesBlockNumber    = document.createElement('div');

    pagesBlockNumber        .innerText = x + 1;

    pagesBlockNumber        .setAttribute('tag', x);

    if(x == 0 && amountOfMembers > 0)
    {
      pagesBlockNumber      .setAttribute('class', 'membersBlockListPagesElementSelected');
    }

    else if(amountOfMembers > (x * 10))
    {
      pagesBlockNumber      .setAttribute('class', 'membersBlockListPagesElementActive');
      pagesBlockNumber      .setAttribute('onclick', 'changeMembersPage(' + x + ')');
    }

    else
    {
      pagesBlockNumber      .setAttribute('class', 'membersBlockListPagesElementInactive');
    }

    pagesBlock              .appendChild(pagesBlockNumber);

    if((x += 1) <= endPage) loop();

    else
    {
      if(document.getElementById('rightsOnServicesHomeMembersBlockList')) document.getElementById('rightsOnServicesHomeMembersBlockList').appendChild(pagesBlock);
      callback();
    }
  }

  loop();
}

/****************************************************************************************************/

function createAccountListBlock(accounts, members, strings, callback)
{
  var accountsBlock                         = document.createElement('div');
  var accountsBlockBackground               = document.createElement('div');
  var accountsBlockTitle                    = document.createElement('div');
  var accountsBlockHelp                     = document.createElement('div');
  var accountsBlockList                     = document.createElement('div');
  var accountsBlockListHeader               = document.createElement('div');
  var accountsBlockListHeaderBox            = document.createElement('div');
  var accountsBlockListHeaderEmail          = document.createElement('div');
  var accountsBlockListHeaderLastname       = document.createElement('div');
  var accountsBlockListHeaderFirstname      = document.createElement('div');
  var accountsBlockListElements             = document.createElement('div');
  var accountsBlockListPages                = document.createElement('div');
  var accountsBlockListEmpty                = document.createElement('div');
  var accountsBlockListHeaderBoxInput       = document.createElement('input');
  var accountsBlockSearch                   = document.createElement('input');
  var accountsBlockAdd                      = document.createElement('button');
  var accountsBlockClose                    = document.createElement('button');

  accountsBlock                             .setAttribute('id', 'rightsOnServicesHomeAccountsBlock');
  accountsBlockBackground                   .setAttribute('id', 'rightsOnServicesHomeAccountsBlockBackground');
  accountsBlockAdd                          .setAttribute('id', 'rightsOnServicesHomeAccountsBlockAdd');
  accountsBlockListElements                 .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListElements');
  accountsBlockListPages                    .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListPages');
  accountsBlockListEmpty                    .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListEmpty');
  accountsBlockSearch                       .setAttribute('id', 'rightsOnServicesHomeAccountsBlockSearch');
  accountsBlockListHeaderBoxInput           .setAttribute('id', 'rightsOnServicesHomeAccountsBlockSelectAll');

  accountsBlock                             .setAttribute('class', 'accountsBlock');
  accountsBlockBackground                   .setAttribute('class', 'accountsBlockBackground');
  accountsBlockTitle                        .setAttribute('class', 'accountsBlockTitle');
  accountsBlockHelp                         .setAttribute('class', 'accountsBlockHelp');
  accountsBlockSearch                       .setAttribute('class', 'accountsBlockSearch');
  accountsBlockAdd                          .setAttribute('class', 'accountsBlockAddActive');
  accountsBlockClose                        .setAttribute('class', 'accountsBlockClose');
  accountsBlockList                         .setAttribute('class', 'accountsBlockList');
  accountsBlockListHeader                   .setAttribute('class', 'accountsBlockListHeader');
  accountsBlockListHeaderBox                .setAttribute('class', 'accountsBlockListHeaderBox');
  accountsBlockListHeaderBoxInput           .setAttribute('class', 'accountsBlockListHeaderBoxInput');
  accountsBlockListHeaderEmail              .setAttribute('class', 'accountsBlockListHeaderEmail');
  accountsBlockListHeaderLastname           .setAttribute('class', 'accountsBlockListHeaderLastname');
  accountsBlockListHeaderFirstname          .setAttribute('class', 'accountsBlockListHeaderFirstname');
  accountsBlockListPages                    .setAttribute('class', 'accountsBlockListPages');
  accountsBlockListElements                 .setAttribute('class', 'accountsBlockListElements');
  accountsBlockListEmpty                    .setAttribute('class', 'accountsBlockListEmpty');

  accountsBlockListEmpty                    .style.display = 'none';

  accountsBlockSearch                       .setAttribute('title', strings.admin.servicesRights.membersBlock.hints.accountsBlock.searchBar);

  accountsBlockSearch                       .setAttribute('placeholder', strings.admin.servicesRights.accountsBlock.searchPlaceholder);

  accountsBlockClose                        .setAttribute('onclick', 'closeAccountsBlock()');

  accountsBlockListHeaderBoxInput           .setAttribute('type', 'checkbox');

  accountsBlockListHeaderBoxInput           .addEventListener('click', selectAllAccounts);
  accountsBlockSearch                       .addEventListener('input', searchAccounts);
  accountsBlockAdd                          .addEventListener('click', addMultipleAccountsToMembers);

  accountsBlockTitle                        .innerText = strings.admin.servicesRights.accountsBlock.title;
  accountsBlockHelp                         .innerText = strings.admin.servicesRights.accountsBlock.help;
  accountsBlockAdd                          .innerText = strings.admin.servicesRights.accountsBlock.addSelected;
  accountsBlockClose                        .innerText = strings.admin.servicesRights.accountsBlock.close;
  accountsBlockListEmpty                    .innerText = strings.admin.servicesRights.accountsBlock.empty;

  accountsBlockListHeaderEmail              .innerText = strings.admin.servicesRights.accountsBlock.header.email;
  accountsBlockListHeaderLastname           .innerText = strings.admin.servicesRights.accountsBlock.header.lastname;
  accountsBlockListHeaderFirstname          .innerText = strings.admin.servicesRights.accountsBlock.header.firstname;

  accountsBlockListHeaderBox                .appendChild(accountsBlockListHeaderBoxInput);

  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderBox);
  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderEmail);
  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderLastname);
  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderFirstname);

  var x = 0, counter = 0;

  var browseAccounts = () =>
  {
    if(members[Object.keys(accounts)[x]] == undefined)
    {
      counter += 1;

      var account = accounts[Object.keys(accounts)[x]];

      var accountsBlockListElementsAccount              = document.createElement('div');
      var accountsBlockListElementsAccountBox           = document.createElement('div');
      var accountsBlockListElementsAccountEmail         = document.createElement('div');
      var accountsBlockListElementsAccountLastname      = document.createElement('div');
      var accountsBlockListElementsAccountFirstname     = document.createElement('div');
      var accountsBlockListElementsAccountAdd           = document.createElement('div');

      accountsBlockListElementsAccount                  .setAttribute('name', 'displayed');
      accountsBlockListElementsAccount                  .setAttribute('tag', Math.floor(x / 10));

      accountsBlockListElementsAccount                  .setAttribute('id', account.uuid);

      accountsBlockListElementsAccount                  .setAttribute('class', 'accountsBlockListElementsAccount');
      accountsBlockListElementsAccountBox               .setAttribute('class', 'accountsBlockListElementsAccountBox');
      accountsBlockListElementsAccountEmail             .setAttribute('class', 'accountsBlockListElementsAccountEmail');
      accountsBlockListElementsAccountLastname          .setAttribute('class', 'accountsBlockListElementsAccountLastname');
      accountsBlockListElementsAccountFirstname         .setAttribute('class', 'accountsBlockListElementsAccountFirstname');
      accountsBlockListElementsAccountAdd               .setAttribute('class', 'accountsBlockListElementsAccountAdd');

      accountsBlockListElementsAccountBox               .innerHTML = '<input class="accountsBlockListElementsAccountBoxInput" type="checkbox" />';
      accountsBlockListElementsAccountEmail             .innerText = accounts[Object.keys(accounts)[x]].email;
      accountsBlockListElementsAccountLastname          .innerText = accounts[Object.keys(accounts)[x]].lastname.toUpperCase();
      accountsBlockListElementsAccountFirstname         .innerText = accounts[Object.keys(accounts)[x]].firstname.charAt(0).toUpperCase() + accounts[Object.keys(accounts)[x]].firstname.slice(1).toLowerCase();
      accountsBlockListElementsAccountAdd               .innerHTML = '<i class="accountsBlockListElementsAccountAddButton fas fa-user-plus"></i>';

      accountsBlockListElementsAccountBox.children[0]   .addEventListener('change', selectAccount);
      accountsBlockListElementsAccountAdd               .addEventListener('click', () => { addAccountToMembers(account); });

      if(counter > 10) accountsBlockListElementsAccount.style.display = 'none';

      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountBox);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountEmail);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountLastname);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountFirstname);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountAdd);

      accountsBlockListElements                         .appendChild(accountsBlockListElementsAccount);
    }

    if(accounts[Object.keys(accounts)[x += 1]] != undefined) browseAccounts();

    else
    {
      if(counter == 0)
      {
        accountsBlockListEmpty.removeAttribute('style');
      }

      var y = 0;

      var displayPages = () =>
      {
        var accountsBlockListPagesElement           = document.createElement('div');

        accountsBlockListPagesElement               .setAttribute('tag', y);

        if(y == 0 && counter > 0) accountsBlockListPagesElement.setAttribute('class', 'accountsBlockListPagesElementSelected');
        
        else if(counter == 0 || y > Math.floor(counter / 10)) accountsBlockListPagesElement.setAttribute('class', 'accountsBlockListPagesElementInactive');
        
        else
        { 
          accountsBlockListPagesElement.setAttribute('class', 'accountsBlockListPagesElementActive');
          accountsBlockListPagesElement.setAttribute('onclick', 'changeAccountsBlockPage(' + y + ')');
        }

        accountsBlockListPagesElement               .innerText = y + 1;

        accountsBlockListPages                      .appendChild(accountsBlockListPagesElement);

        if((y += 1) < 10) displayPages();

        else
        {
          accountsBlockList                         .appendChild(accountsBlockListHeader);
          accountsBlockList                         .appendChild(accountsBlockListEmpty);
          accountsBlockList                         .appendChild(accountsBlockListElements);
          accountsBlockList                         .appendChild(accountsBlockListPages);

          accountsBlock                             .appendChild(accountsBlockTitle);
          accountsBlock                             .appendChild(accountsBlockHelp);
          accountsBlock                             .appendChild(accountsBlockSearch);
          accountsBlock                             .appendChild(accountsBlockAdd);
          accountsBlock                             .appendChild(accountsBlockList);
          accountsBlock                             .appendChild(accountsBlockClose);

          $(accountsBlock)                          .hide().appendTo(document.body);
          $(accountsBlockBackground)                .hide().appendTo(document.body);

          callback();
        }
      }

      displayPages();
    }
  }

  browseAccounts();
}

/****************************************************************************************************/