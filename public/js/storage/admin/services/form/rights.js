/****************************************************************************************************/

function getValuesBlock(target, callback)
{
  var values = target;

  var getParentLoop = () =>
  {
    if(values.hasAttribute('name') == false || values.getAttribute('name') != 'values')
    {
      values = values.parentNode;

      getParentLoop();
    }

    else
    {
      callback(values);
    }
  }

  getParentLoop();
}

/****************************************************************************************************/

function activateCommentRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[0].setAttribute('class', 'true active');
    values.children[1].setAttribute('class', 'false inactive');

    values.children[0].setAttribute('tag', 'true');
    values.children[1].setAttribute('tag', 'false');
  });
}

/****************************************************************************************************/

function activateUploadRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[2].setAttribute('class', 'true active');
    values.children[3].setAttribute('class', 'false inactive');

    values.children[2].setAttribute('tag', 'true');
    values.children[3].setAttribute('tag', 'false');
  });
}

/****************************************************************************************************/

function activateDownloadRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[4].setAttribute('class', 'true active');
    values.children[5].setAttribute('class', 'false inactive');

    values.children[4].setAttribute('tag', 'true');
    values.children[5].setAttribute('tag', 'false');
  });
}

/****************************************************************************************************/

function activateRemoveRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[6].setAttribute('class', 'true active');
    values.children[7].setAttribute('class', 'false inactive');

    values.children[6].setAttribute('tag', 'true');
    values.children[7].setAttribute('tag', 'false');
  });
}

/****************************************************************************************************/

function desactivateCommentRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[0].setAttribute('class', 'true inactive');
    values.children[1].setAttribute('class', 'false active');

    values.children[0].setAttribute('tag', 'false');
    values.children[1].setAttribute('tag', 'true');
  });
}

/****************************************************************************************************/

function desactivateUploadRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[2].setAttribute('class', 'true inactive');
    values.children[3].setAttribute('class', 'false active');

    values.children[2].setAttribute('tag', 'false');
    values.children[3].setAttribute('tag', 'true');
  });
}

/****************************************************************************************************/

function desactivateDownloadRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[4].setAttribute('class', 'true inactive');
    values.children[5].setAttribute('class', 'false active');

    values.children[4].setAttribute('tag', 'false');
    values.children[5].setAttribute('tag', 'true');
  });
}

/****************************************************************************************************/

function desactivateRemoveRight(event)
{
  getValuesBlock(event.target, (values) =>
  {
    values.children[6].setAttribute('class', 'true inactive');
    values.children[7].setAttribute('class', 'false active');

    values.children[6].setAttribute('tag', 'false');
    values.children[7].setAttribute('tag', 'true');
  });
}

/****************************************************************************************************/