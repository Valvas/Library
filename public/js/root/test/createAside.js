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

    return callback(null);
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

    asideMenuElement      .addEventListener('click', () => loadLocation(location));

    asideMenu             .appendChild(asideMenuElement);
  }

  return createAsideArticlesSection(asideMenu, callback);
}

/****************************************************************************************************/

function createAsideArticlesSection(asideMenu, callback)
{
  var asideArticles = document.createElement('div');
  var articlesList  = document.createElement('ul');

  asideArticles     .setAttribute('class', 'asideArticles');
  articlesList      .setAttribute('class', 'asideArticlesList');

  asideArticles     .innerHTML += `<div class="asideArticlesTitle">${commonStrings.articles.aside.lastArticles}</div>`;

  for(var x = 0; x < articlesData.length; x++)
  {
    var currentArticle  = document.createElement('li');

    currentArticle      .setAttribute('class', 'asideArticlesListElement');

    currentArticle      .innerHTML += `<div class="asideArticlesListElementDate">${articlesData[x].timestamp}</div>`;
    currentArticle      .innerHTML += `<div class="asideArticlesListElementTitle">${articlesData[x].title}</div>`;

    articlesList        .appendChild(currentArticle);
  }

  asideArticles     .appendChild(articlesList);

  return callback(null, asideMenu, asideArticles);
}

/****************************************************************************************************/
