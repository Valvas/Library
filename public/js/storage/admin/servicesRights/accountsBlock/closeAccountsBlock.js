/****************************************************************************************************/

function closeAccountsBlock()
{
  if(document.getElementById('rightsOnServicesHomeAccountsBlock'))
  {
    $(document.getElementById('rightsOnServicesHomeAccountsBlock')).toggle('slide', 'left', 250, () =>
    {
      if(document.getElementById('rightsOnServicesHomeAccountsBlockBackground'))
      {
        $(document.getElementById('rightsOnServicesHomeAccountsBlockBackground')).slideUp(250);
      }
    });
  }
}

/****************************************************************************************************/