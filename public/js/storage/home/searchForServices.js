/****************************************************************************************************/

function searchForServices(event)
{
  if(Object.keys(servicesData).length === 0) return;

  const searchedValue = event.target.value.trim().toLowerCase();

  document.getElementById('emptyServicesSearch').removeAttribute('style');

  const currentServices = document.getElementById('homeServicesContainerList').children;

  var counter = 0;

  for(var x = 0; x < currentServices.length; x++)
  {
    if(currentServices[x].children[0].innerText.toLowerCase().includes(searchedValue))
    {
      counter += 1;
      currentServices[x].removeAttribute('style');
      continue;
    }

    currentServices[x].style.display = 'none';
  }

  if(counter === 0) document.getElementById('emptyServicesSearch').style.display = 'block';
}

/****************************************************************************************************/
