/****************************************************************************************************/
/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/
/****************************************************************************************************/

socket.on('connect', () => { socket.emit('rootNewsJoin') });

/****************************************************************************************************/
// WHEN A NEWS HAS BEEN CREATED
/****************************************************************************************************/

socket.on('newsCreated', (newsData) =>
{
  if(document.getElementById('asideNewsBlockList'))
  {
    const news = document.getElementById('asideNewsBlockList').children;
    var currentPage = null;

    for(var x = 0; x < news.length; x++)
    {
      if(news[x].getAttribute('class') === 'asideNewsBlockListElementSelected') currentPage = Math.floor(x / 5);
    }

    var newsBlock         = document.createElement('div');
    var newsBlockDate     = document.createElement('div');
    var newsBlockTitle    = document.createElement('div');

    newsBlock             .setAttribute('id', newsData.uuid);

    newsBlock             .setAttribute('class', 'asideNewsBlockListElementHidden');
    newsBlockDate         .setAttribute('class', 'asideNewsBlockListElementDate');
    newsBlockTitle        .setAttribute('class', 'asideNewsBlockListElementTitle');

    newsBlockDate         .innerText = newsData.timestamp;
    newsBlockTitle        .innerText = newsData.title;

    newsBlock             .appendChild(newsBlockDate);
    newsBlock             .appendChild(newsBlockTitle);

    document.getElementById('asideNewsBlockList').insertBefore(newsBlock, document.getElementById('asideNewsBlockList').children[0]);

    changeNewsAsidePage(currentPage);
  }
});

/****************************************************************************************************/
/****************************************************************************************************/