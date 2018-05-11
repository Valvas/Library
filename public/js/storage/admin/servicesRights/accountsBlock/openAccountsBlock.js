/****************************************************************************************************/

function openAccountsBlock()
{
  if(document.getElementById('rightsOnServicesHomeAccountsBlockBackground'))
  {
    $(document.getElementById('rightsOnServicesHomeAccountsBlockBackground')).slideDown(250, () =>
    {
      if(document.getElementById('rightsOnServicesHomeAccountsBlock'))
      {
        $(document.getElementById('rightsOnServicesHomeAccountsBlock')).toggle('slide', 'left', 250);
      }
    });
  }
}

/****************************************************************************************************/