var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  if(document.getElementById('rightsDetailAccountInfo')) socket.emit('adminAppRightsDetailJoin', document.getElementById('rightsDetailAccountInfo').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('updateRights', (error, rights, strings) =>
{
  $.ajax(
  {
    type: 'GET', timeout: 2000, dataType: 'JSON', url: '/queries/admin/rights/get-session-rights', success: () => {},
    error: (xhr, status, error) =>
    {

    }
                    
  }).done((json) => 
  {
    for(var right in rights)
    {
      var rightSplitted = right.split('_'), x = 0, rightName = '';
  
      var collapseLoop = () =>
      {
        if(x == 0) rightName = rightSplitted[x].toLowerCase();
  
        if(x > 0) rightName = rightName + rightSplitted[x].charAt(0).toUpperCase() + rightSplitted[x].slice(1).toLowerCase();
  
        if(rightSplitted[x += 1] != undefined) collapseLoop();
      }
  
      collapseLoop();

      if(document.getElementById(rightName))
      {
        var rightBlock = document.getElementById(rightName);

        if(rights[right] == 1)
        {
          if(json.rights.remove_rights == 1) rightBlock.innerHTML = '<div class="rightsDetailAppsRightsTrue">' + strings.rights.detail.administrationRights[rightName] + '</div>' + '<button onclick=removeRight("' + right + '") name="' + rightName + '" class="rightsDetailAppsRightsButtonDeactivate" title="' + strings.rights.detail.administrationRights.buttons.removeRight.titleActive + '">' + strings.rights.detail.administrationRights.buttons.removeRight.content + '</button>';
          if(json.rights.remove_rights == 0) rightBlock.innerHTML = '<div class="rightsDetailAppsRightsTrue">' + strings.rights.detail.administrationRights[rightName] + '</div>' + '<button class="rightsDetailAppsRightsButtonInactive" title="' + strings.rights.detail.administrationRights.buttons.removeRight.titleInactive + '">' + strings.rights.detail.administrationRights.buttons.removeRight.content + '</button>';
        }
    
        else
        {
          if(json.rights.add_rights == 1) rightBlock.innerHTML = '<div class="rightsDetailAppsRightsFalse">' + strings.rights.detail.administrationRights[rightName] + '</div>' + '<button onclick=addRight("' + right + '") name="' + removeRights + '" class="rightsDetailAppsRightsButtonActivate" title="' + strings.rights.detail.administrationRights.buttons.addRight.titleActive + '">' + strings.rights.detail.administrationRights.buttons.addRight.content + '</button>';
          if(json.rights.add_rights == 0) rightBlock.innerHTML = '<div class="rightsDetailAppsRightsFalse">' + strings.rights.detail.administrationRights[rightName] + '</div>' + '<button class="rightsDetailAppsRightsButtonInactive" title="' + strings.rights.detail.administrationRights.buttons.addRight.titleInactive + '">' + strings.rights.detail.administrationRights.buttons.addRight.content + '</button>';
        }
      }
    }
  });
});

/****************************************************************************************************/