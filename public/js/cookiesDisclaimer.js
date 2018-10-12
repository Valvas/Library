/****************************************************************************************************/

if(document.getElementById('cookiesDisclaimerClose')) document.getElementById('cookiesDisclaimerClose').addEventListener('click', closeCookiesDisclaimer);

/****************************************************************************************************/

function closeCookiesDisclaimer(event)
{
  if(document.getElementById('cookiesDisclaimer')) document.getElementById('cookiesDisclaimer').remove();
}

/****************************************************************************************************/