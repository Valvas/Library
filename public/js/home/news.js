window.onload = $(function()
{
  $.ajax(
    {
      type: 'GET', timeout: 2000, dataType: 'JSON', url: '/home/get-last-news', success: function(){},
      error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); } 

    }).done(function(json)
    {
      var x = 0;

      var createNewsLoop = function(news)
      {
        $(document.getElementById('home-news-block')).append(`<div class='home-news-block-element'><p class='home-news-block-element-title'>${news['title']}</p><p class='home-news-block-element-date'>${news['date']}</p><p class='home-news-block-element-content'>${news['content']}</p></div>`);
        
        x++;
        
        if(Object.keys(json)[x] != undefined) createNewsLoop(json[Object.keys(json)[x]]);
      }

      Object.keys(json)[x] == undefined ? $(document.getElementById('home-news-block')).append(`<div class='home-news-block-element'><p class='home-news-block-element-title'>Bonjour</p><p class='home-news-block-element-date'>${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()} - ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}</p><p class='home-news-block-element-content'>Rien à signaler aujourd'hui.</p></div>`) : createNewsLoop(json[Object.keys(json)[x]]);
    });
});