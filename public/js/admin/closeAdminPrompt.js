/****************************************************************************************************/

function closeAdminPrompt()
{
  if(document.getElementById('adminAppPrompt'))
  {
    $(document.getElementById('adminAppPrompt')).fadeOut(250, () =>
    {
      document.getElementById('adminAppPrompt').remove();

      if(document.getElementById('adminAppBackground'))
      {
        document.getElementById('adminAppBackground').remove();

        if(document.getElementById('blur'))
        {
          document.getElementById('blur').removeAttribute('style');
        }
      }
    });
  }
}

/****************************************************************************************************/