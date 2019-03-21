/****************************************************************************************************/

var currentSearchRequest = null;

/****************************************************************************************************/

function searchForElementsRetrieveFromServer(event)
{
  event.preventDefault();

  const searchedValue = event.target.elements['search'].value.trim().toLowerCase();
  const originalValue = event.target.elements['search'].value.trim();

  if(searchedValue.length === 0) return;

  document.getElementById('currentServiceContent').style.display = 'none';

  if(currentSearchRequest != null) currentSearchRequest.abort();

  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  /********************************************************************************/

  const searchSection       = document.createElement('div');
  const searchHeader        = document.createElement('div');
  const searchHeaderTerm    = document.createElement('div');
  const searchHeaderClose   = document.createElement('button');
  const searchMessages      = document.createElement('div');
  const searchResult        = document.createElement('div');

  searchSection       .setAttribute('id', 'searchSection');
  searchResult        .setAttribute('id', 'searchSectionResult');

  searchHeader        .setAttribute('class', 'serviceSearchSectionHeader');
  searchHeaderTerm    .setAttribute('class', 'serviceSearchSectionHeaderTerm');

  searchHeaderClose   .innerText = storageStrings.serviceSection.searchSection.closeSearch;

  searchHeaderClose   .addEventListener('click', searchForElementsCloseSearch);

  searchHeaderTerm    .innerHTML += `<div class="serviceSearchSectionHeaderTermKey">${storageStrings.serviceSection.searchSection.currentSearch} :</div><div class="serviceSearchSectionHeaderTermValue">${originalValue}</div>`;
  searchMessages      .innerHTML += `<div class="serviceSearchSectionMessage"><div class="serviceSearchSectionMessageSpinner"></div><div class="serviceSearchSectionMessageValue">${storageStrings.serviceSection.searchSection.searchLoader}</div></div>`;

  searchHeader        .appendChild(searchHeaderTerm);
  searchHeader        .appendChild(searchHeaderClose);

  searchSection       .appendChild(searchHeader);
  searchSection       .appendChild(searchMessages);
  searchSection       .appendChild(searchResult);

  searchResult        .style.display = 'none';

  document.getElementById('serviceStorageContainer').appendChild(searchSection);

  /********************************************************************************/

  currentSearchRequest = $.ajax(
  {
    method: 'POST', dataType: 'json', timeout: 10000, data: { searchedValue: searchedValue, serviceUuid: serviceUuid }, url: '/queries/storage/services/search-for-elements',

    error: (xhr, textStatus, errorThrown) =>
    {
      if(textStatus === 'abort') return;

      searchMessages.innerHTML = xhr.responseJSON != undefined
      ? `<div class="serviceSearchSectionMessage"><div class="serviceSearchSectionMessageSpinner"></div><div class="serviceSearchSectionMessageValue">${xhr.responseJSON.message}</div>`
      : `<div class="serviceSearchSectionMessageError">${commonStrings.global.xhrErrors.timeout}</div>`;
    }

  }).done((searchResults) =>
  {
    if(searchResults.length === 0)
    {
      return searchMessages.innerHTML = `<div class="serviceSearchSectionMessage">${storageStrings.serviceSection.searchSection.emptyResult}</div>`;
    }

    /********************************************************************************/

    const rootBlock = document.createElement('div');

    rootBlock.setAttribute('class', 'serviceSearchSectionContainer');

    rootBlock.innerHTML += `<div class="serviceSearchSectionContainerPath">${storageStrings.serviceSection.pathRoot}</div>`;
    rootBlock.innerHTML += `<div class="serviceSearchSectionContainerElements"></div>`;
    rootBlock.innerHTML += `<div class="serviceSearchSectionContainerElements"></div>`;

    searchResult.appendChild(rootBlock);

    /********************************************************************************/

    var index = 0;

    const browseElements = (currentElement) =>
    {
      appendElementToSearchContainer(currentElement, currentServiceAccountRights, () =>
      {
        if(searchResults[index += 1] != undefined) return browseElements(searchResults[index]);

        searchMessages.innerHTML = '';

        $(searchResult).fadeIn(250);
      });
    }

    browseElements(searchResults[index]);
  });
}

/****************************************************************************************************/

function searchForElementsCloseSearch(event)
{
  if(currentSearchRequest != null) currentSearchRequest.abort();

  if(document.getElementById('searchSection')) document.getElementById('searchSection').remove();
  if(document.getElementById('currentServiceContent')) document.getElementById('currentServiceContent').removeAttribute('style');
}

/****************************************************************************************************/
