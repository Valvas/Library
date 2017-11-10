window.onload = $(function()
{
  $.ajax(
  {
    type: 'GET', timeout: 2000, dataType: 'JSON', url: '/menu/get-aside-links', success: function(){},
    error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
            
  }).done(function(json)
  {
    var x = 0;

    var createAsideLinks = function(serviceName, serviceContent)
    {
      $(document.getElementById('service-main-block')).attr('name') == serviceName ?
      $(document.getElementById('aside-navigation-block')).append(`<li id='${serviceName}' name='aside-navigation-block-link' class='aside-navigation-block-element-selected'>${serviceContent['name']}</li>`):
      $(document.getElementById('aside-navigation-block')).append(`<li id='${serviceName}' name='aside-navigation-block-link' class='aside-navigation-block-element'>${serviceContent['name']}</li>`);

      x++;

      if(Object.keys(json)[x] != undefined) createAsideLinks(Object.keys(json)[x], json[Object.keys(json)[x]]);
    };

    if(Object.keys(json)[x] != undefined) createAsideLinks(Object.keys(json)[x], json[Object.keys(json)[x]]);
  });
});