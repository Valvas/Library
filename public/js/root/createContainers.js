/****************************************************************************************************/

function createContainer(callback)
{
  var wrapper     = document.createElement('div');
  var content     = document.createElement('div');

  wrapper         .setAttribute('id', 'wrapperContainer');
  content         .setAttribute('id', 'contentContainer');

  wrapper         .appendChild(content);

  document.getElementById('mainContainer').appendChild(wrapper);

  return createAside(callback);
}

/****************************************************************************************************/
