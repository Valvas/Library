/****************************************************************************************************/

function createContainers(callback)
{
  const contentContainer  = document.createElement('div');
  const asideContainer    = document.createElement('div');
  const locationContainer = document.createElement('div');
  const locationWrapper   = document.createElement('div');

  contentContainer        .setAttribute('id', 'contentContainer');
  asideContainer          .setAttribute('id', 'asideContainer');
  locationWrapper         .setAttribute('id', 'locationWrapper');
  locationContainer       .setAttribute('id', 'locationContainer');

  locationWrapper         .appendChild(locationContainer);

  contentContainer        .appendChild(asideContainer);
  contentContainer        .appendChild(locationWrapper);

  document.getElementById('mainContainer').appendChild(contentContainer);

  return createAside(callback);
}

/****************************************************************************************************/
