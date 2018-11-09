/****************************************************************************************************/

var commonStrings = null;

if(document.getElementById('reloadButton')) document.getElementById('reloadButton').addEventListener('click', reloadTests);
if(document.getElementById('saveButton')) document.getElementById('saveButton').addEventListener('click', saveConfiguration);

/****************************************************************************************************/

displayLoader('', (loader) =>
{
  getCommonStrings((error, strings) =>
  {
    removeLoader(loader, () =>
    {
      if(error != null)
      {
        displayError(error.message, error.detail, null);
        return;
      }

      commonStrings = strings;

      testDatabaseConnection(commonStrings);
    });
  });
});


/****************************************************************************************************/

function reloadTests()
{
  if(commonStrings == null) return;
  if(document.getElementById('storageBlock') == null) return;
  if(document.getElementById('databaseBlock') == null) return;
  if(document.getElementById('transporterBlock') == null) return;

  document.getElementById('storageBlock').setAttribute('class', 'initTestWaiting');
  document.getElementById('databaseBlock').setAttribute('class', 'initTestWaiting');
  document.getElementById('transporterBlock').setAttribute('class', 'initTestWaiting');

  document.getElementById('saveButton').removeAttribute('style');
  document.getElementById('reloadButton').removeAttribute('style');

  testDatabaseConnection(commonStrings);
}

/****************************************************************************************************/

function testDatabaseConnection(strings)
{
  if(document.getElementById('databaseBlock') == null) return;

  document.getElementById('databaseBlock').setAttribute('class', 'initTestPending');

  document.getElementById('databaseBlock').children[1].innerHTML = `<i class="initTestLoadingIcon fas fa-spinner fa-pulse"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.loadingMessage}</div>`;

  setTimeout(() =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 60000, dataType: 'JSON', url: '/init/test/database', success: () => {},
      error: (xhr, status, error) => 
      {
        document.getElementById('databaseBlock').setAttribute('class', 'initTestFailure');

        document.getElementById('reloadButton').style.display = 'block';

        xhr.responseJSON != undefined
        ? document.getElementById('databaseBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-times-circle"></i><div class="initTestLoadingMessage">${xhr.responseJSON.message}</div>`
        : document.getElementById('databaseBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-times-circle"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.failureMessage}</div>`;
      }
      
    }).done((result) =>
    {
      document.getElementById('databaseBlock').setAttribute('class', 'initTestSuccess');
  
      document.getElementById('databaseBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-check-circle"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.successMessage}</div>`;
    
      testStorageAccess(strings);
    });
  }, 3000);
}

/****************************************************************************************************/

function testStorageAccess(strings)
{
  if(document.getElementById('storageBlock') == null) return;

  document.getElementById('storageBlock').setAttribute('class', 'initTestPending');

  document.getElementById('storageBlock').children[1].innerHTML = `<i class="initTestLoadingIcon fas fa-spinner fa-pulse"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.loadingMessage}</div>`;

  setTimeout(() =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 60000, dataType: 'JSON', url: '/init/test/storage', success: () => {},
      error: (xhr, status, error) => 
      {
        document.getElementById('storageBlock').setAttribute('class', 'initTestFailure');

        document.getElementById('reloadButton').style.display = 'block';

        xhr.responseJSON != undefined
        ? document.getElementById('storageBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-times-circle"></i><div class="initTestLoadingMessage">${xhr.responseJSON.message}</div>`
        : document.getElementById('storageBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-times-circle"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.failureMessage}</div>`;
      }
      
    }).done((result) =>
    {
      document.getElementById('storageBlock').setAttribute('class', 'initTestSuccess');
  
      document.getElementById('storageBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-check-circle"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.successMessage}</div>`;
    
      testTransporterAccess(strings);
    });
  }, 3000);
}

/****************************************************************************************************/

function testTransporterAccess(strings)
{
  if(document.getElementById('transporterBlock') == null) return;

  document.getElementById('transporterBlock').setAttribute('class', 'initTestPending');

  document.getElementById('transporterBlock').children[1].innerHTML = `<i class="initTestLoadingIcon fas fa-spinner fa-pulse"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.loadingMessage}</div>`;

  setTimeout(() =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 60000, dataType: 'JSON', url: '/init/test/transporter', success: () => {},
      error: (xhr, status, error) => 
      {
        document.getElementById('transporterBlock').setAttribute('class', 'initTestFailure');

        document.getElementById('reloadButton').style.display = 'block';

        xhr.responseJSON != undefined
        ? document.getElementById('transporterBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-times-circle"></i><div class="initTestLoadingMessage">${xhr.responseJSON.message}</div>`
        : document.getElementById('transporterBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-times-circle"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.failureMessage}</div>`;
      }
      
    }).done((result) =>
    {
      document.getElementById('transporterBlock').setAttribute('class', 'initTestSuccess');
  
      document.getElementById('transporterBlock').children[1].innerHTML = `<i class="initTestLoadingIcon far fa-check-circle"></i><div class="initTestLoadingMessage">${strings.initSection.endPage.successMessage}</div>`;
    
      document.getElementById('saveButton').style.display = 'block';

      document.getElementById('reloadButton').style.display = 'block';
    });
  }, 3000);
}

/****************************************************************************************************/

function saveConfiguration()
{
  if(document.getElementById('initSaveBackground')) return;

  createBackground('initSaveBackground');

  displayLoader(commonStrings.initSection.endPage.savingLoader, (loader) =>
  {
    setTimeout(() =>
    {
      $.ajax(
      {
        type: 'GET', timeout: 10000, dataType: 'JSON', url: '/init/end', success: () => {},
        error: (xhr, status, error) => 
        {
          removeLoader(loader, () =>
          {
            removeBackground('initSaveBackground');
  
            xhr.responseJSON != undefined
            ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
            : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
          });
        }
        
      }).done((result) =>
      {
        location = '/';
      });
    }, 3000);
  });
}

/****************************************************************************************************/