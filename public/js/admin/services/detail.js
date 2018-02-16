/****************************************************************************************************/

getServiceDetail();

document.getElementById('reload').addEventListener('click', getServiceDetail);

/****************************************************************************************************/

function getServiceDetail()
{
  document.getElementById('error').removeAttribute('style');
  document.getElementById('error').children[2].removeAttribute('style');
  document.getElementById('content').style.filter = 'blur(2px)';
  document.getElementById('background').style.display = 'block';

  $.ajax(
  {
    type: 'POST', timeout: 5000, dataType: 'JSON', data: { service: document.getElementById('main').getAttribute('name') }, url: '/admin/services/get-detail', success: () => {},
    error: (xhr, status, error) => 
    {
      document.getElementById('content').removeAttribute('style');
      document.getElementById('background').removeAttribute('style');
      document.getElementById('error').style.display = 'block';

      if(status == 'timeout')
      {
        document.getElementById('error').children[1].innerText = 'Le serveur a mis trop de temps à répondre';
      }

      else
      {
        document.getElementById('error').children[1].innerText = xhr.responseJSON.message;

        if(xhr.responseJSON.detail != undefined)
        {
          document.getElementById('error').children[2].children[1].innerText = xhr.responseJSON.detail;
          document.getElementById('error').children[2].style.display = 'block';
        }
      }
    }

  }).done((json) =>
  {
    console.log(true);
  });
}

/****************************************************************************************************/