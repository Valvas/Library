window.onload = $(function()
{
  $.ajax(
  {
    type: 'GET', timeout: 2000, dataType: 'JSON', url: '/afk-time', success: function(){},
    error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                        
  }).done(function(result)
  {
    var timeout = result.time;
    var counter = 0;

    document.onclick = function()
    { 
      if(document.getElementById('afk-warning-veil')) $(document.getElementById('afk-warning-veil')).remove();
      if(document.getElementById('afk-warning-popup')) $(document.getElementById('afk-warning-popup')).remove();
      counter = 0; 
    }

    document.onkeypress = function()
    { 
      if(document.getElementById('afk-warning-veil')) $(document.getElementById('afk-warning-veil')).remove();
      if(document.getElementById('afk-warning-popup')) $(document.getElementById('afk-warning-popup')).remove();
      counter = 0;
    }

    document.onmousemove = function()
    { 
      if(document.getElementById('afk-warning-veil')) $(document.getElementById('afk-warning-veil')).remove();
      if(document.getElementById('afk-warning-popup')) $(document.getElementById('afk-warning-popup')).remove();
      counter = 0;
    }

    setInterval(function()
    {
      checkTimeout(timeout, counter);
      counter += 1000;

    }, 1000);
  });
});