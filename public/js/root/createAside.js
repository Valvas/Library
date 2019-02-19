/****************************************************************************************************/

function createAside(callback)
{
  var aside   = document.createElement('div');

  aside       .setAttribute('id', 'asideBlock');
  aside       .setAttribute('class', 'asideBlock');

  createAsideMenu((error, asideMenu, asideArticles) =>
  {
    aside     .appendChild(asideMenu);
    aside     .appendChild(asideArticles);

    document.getElementById('contentContainer').appendChild(aside);

    return createMessenger(callback);
  });
}

/****************************************************************************************************/

function createAsideMenu(callback)
{
  var asideMenu             = document.createElement('ul');

  asideMenu         .setAttribute('id', 'asideMenu');
  asideMenu         .setAttribute('class', 'asideMenu');

  for(var key in commonStrings.locations)
  {
    const location = key;

    if(location === 'admin' && accountData.isAdmin == false) continue;

    var asideMenuElement  = document.createElement('li');

    currentLocation === location
    ? asideMenuElement    .setAttribute('class', 'asideMenuElementSelected')
    : asideMenuElement    .setAttribute('class', 'asideMenuElement');

    asideMenuElement      .setAttribute('name', location);

    asideMenuElement      .innerText = commonStrings.locations[location];

    asideMenuElement      .addEventListener('click', () =>
    {
      urlParameters = [];
      loadLocation(location);
    });

    asideMenu             .appendChild(asideMenuElement);
  }

  return createAsideArticlesSection(asideMenu, callback);
}

/****************************************************************************************************/

function createAsideArticlesSection(asideMenu, callback)
{
  var asideArticles = document.createElement('div');
  var articlesEmpty = document.createElement('div');
  var articlesList  = document.createElement('ul');

  asideArticles     .setAttribute('class', 'asideArticles');
  articlesEmpty     .setAttribute('class', 'asideArticlesEmpty');
  articlesList      .setAttribute('class', 'asideArticlesList');

  articlesEmpty     .setAttribute('id', 'asideArticlesEmpty');
  articlesList      .setAttribute('id', 'asideArticlesList');

  asideArticles     .innerHTML += `<div class="asideArticlesTitle">${commonStrings.articles.aside.lastArticles}</div>`;

  articlesEmpty     .innerText = commonStrings.articles.aside.emptyList;

  if(articlesData.length === 0)
  {
    articlesEmpty   .style.display = 'block';
  }

  for(var x = 0; x < articlesData.length; x++)
  {
    const currentArticleUuid = articlesData[x].uuid;

    var currentArticle  = document.createElement('li');

    currentArticle      .setAttribute('class', 'asideArticlesListElement');
    currentArticle      .setAttribute('name', currentArticleUuid);

    currentArticle      .addEventListener('click', () =>
    {
      urlParameters = ['display', currentArticleUuid];
      loadLocation('news');
    });

    currentArticle      .innerHTML += `<div class="asideArticlesListElementDate">${articlesData[x].timestamp}</div>`;
    currentArticle      .innerHTML += `<div class="asideArticlesListElementTitle">${articlesData[x].title}</div>`;

    articlesList        .appendChild(currentArticle);
  }

  asideArticles     .appendChild(articlesEmpty);
  asideArticles     .appendChild(articlesList);

  return callback(null, asideMenu, asideArticles);
}

/****************************************************************************************************/
