function printError(message)
{
  if(document.getElementById('error-popup')) document.getElementById('error-popup').remove();

  $('body').append(`<div id='error-popup' class='error-popup'>${message}</div>`);

  setTimeout(function(){ $(document.getElementById('error-popup')).slideUp(500); setTimeout(function(){ $(document.getElementById('error-popup')).remove(); }, 500); }, 5000);
}