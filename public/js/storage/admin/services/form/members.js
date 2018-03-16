/****************************************************************************************************/

if(document.getElementById('form-second-block-add-member')) document.getElementById('form-second-block-add-member').addEventListener('click', openMembersList);

/****************************************************************************************************/

function openMembersList(event)
{
  if(document.getElementById('background').getAttribute('tag') == 'off')
  {
    document.getElementById('blur').style.filter = 'blur(4px)';
    document.getElementById('background').style.display = 'block';
    document.getElementById('background').setAttribute('tag', 'on');
  }

  else
  {
    document.getElementById('blur').removeAttribute('style');
    document.getElementById('background').removeAttribute('style');
    document.getElementById('background').setAttribute('tag', 'off');
  }
}

/****************************************************************************************************/