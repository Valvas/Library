/****************************************************************************************************/

function loadArticlesSection()
{
  displayLocationLoader();

  var articlesContainer    = document.createElement('div');

  articlesContainer        .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.news}</div>`;

  articlesContainer        .setAttribute('class', 'articlesSectionBlock');

  articlesContainer        .style.display = 'none';

  document.getElementById('locationContent').appendChild(articlesContainer);

  if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

  $(articlesContainer).fadeIn(250);
}

/****************************************************************************************************/
