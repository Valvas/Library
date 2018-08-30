/****************************************************************************************************/

if(document.getElementById('asideNewsDeploy')) document.getElementById('asideNewsDeploy').addEventListener('click', deployAsideNews);
if(document.getElementById('asideNewsDeployBlockClose')) document.getElementById('asideNewsDeployBlockClose').addEventListener('click', closeAsideNews);

/****************************************************************************************************/

function deployAsideNews(event)
{
  var background = document.createElement('div');

  background.setAttribute('id', 'asideNewsDeployBlockBackground');
  background.setAttribute('class', 'asideNewsDeployBlockBackground');

  background.addEventListener('click', closeAsideNews);

  document.body.appendChild(background);

  if(document.getElementById('asideNewsDeployBlock'))
  {
    $(document.getElementById('asideNewsDeployBlock')).toggle('slide', { direction: 'left' }, 250);
  }
}

/****************************************************************************************************/

function closeAsideNews(event)
{
  if(document.getElementById('asideNewsDeployBlock') && $(document.getElementById('asideNewsDeployBlock')).is(':visible'))
  {
    if(document.getElementById('asideNewsDeployBlockBackground')) document.getElementById('asideNewsDeployBlockBackground').remove();

    $(document.getElementById('asideNewsDeployBlock')).toggle('slide', { direction: 'left' }, 250);
  }
}

/****************************************************************************************************/