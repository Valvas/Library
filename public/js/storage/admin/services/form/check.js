/****************************************************************************************************/

if(document.getElementById('form-next-button')) document.getElementById('form-next-button').addEventListener('click', checkFormDataToSendToTheServer);

if(document.getElementById('form-input-size')) document.getElementById('form-input-size').addEventListener('change', checkSizeFormat);
if(document.getElementById('form-input-name')) document.getElementById('form-input-name').addEventListener('change', checkNameFormat);
if(document.getElementById('form-input-identifier')) document.getElementById('form-input-identifier').addEventListener('change', checkIdentifierFormat);

/****************************************************************************************************/

function checkFormDataToSendToTheServer(event)
{
  var check = true;

  if(document.getElementById('form-input-identifier').value.match(/^[a-z]([a-z|0-9]){0,63}$/) == null) check = false;
  if(document.getElementById('form-input-name').value.match(/^([A-Za-z](\s?[A-Za-z0-9])+)$/) == null) check = false;
  if(document.getElementById('form-input-size').value.match(/^[0-9]{1,7}$/) == null) check = false;

  if(check == true)
  {
    document.getElementById('form-first-block').style.display = 'none';
    document.getElementById('form-second-block').style.display = 'block';

    var xhr = new XMLHttpRequest();

    xhr.responseType = 'json';

    xhr.onload = () =>
    {
      if(xhr.status != 200)
      {
        
      }

      else
      {
        createTheMembersList(xhr.response.accounts);
      }
    }

    xhr.open('GET', '/queries/storage/admin/get-accounts-that-have-access-to-the-app', true);

    xhr.send(null);
  }
}

/****************************************************************************************************/

function checkFormDataToDisplayButton()
{
  var check = true;

  if(document.getElementById('form-input-identifier').value.match(/^[a-z]([a-z|0-9]){0,63}$/) == null) check = false;
  if(document.getElementById('form-input-name').value.match(/^([A-Za-z](\s?[A-Za-z0-9])+)$/) == null) check = false;
  if(document.getElementById('form-input-size').value.match(/^[0-9]{1,7}$/) == null) check = false;

  if(check == true) document.getElementById('form-next-button').setAttribute('class', 'next active');
}

/****************************************************************************************************/

function checkIdentifierFormat(event)
{
  if(document.getElementById('form-input-identifier').value.match(/^[a-z]([a-z|0-9]){0,63}$/) == null)
  {
    document.getElementById('form-input-identifier-correct').removeAttribute('style');
    document.getElementById('form-input-identifier-incorrect').style.display = 'block';
  }

  else
  {
    document.getElementById('form-input-identifier-incorrect').removeAttribute('style');
    document.getElementById('form-input-identifier-correct').style.display = 'block';

    checkFormDataToDisplayButton();
  }
}

/****************************************************************************************************/

function checkNameFormat(event)
{
  if(document.getElementById('form-input-name').value.match(/^([A-Za-z](\s?[A-Za-z0-9])+)$/) == null)
  {
    document.getElementById('form-input-name-correct').removeAttribute('style');
    document.getElementById('form-input-name-incorrect').style.display = 'block';
  }

  else
  {
    document.getElementById('form-input-name-incorrect').removeAttribute('style');
    document.getElementById('form-input-name-correct').style.display = 'block';

    checkFormDataToDisplayButton();
  }
}

/****************************************************************************************************/

function checkSizeFormat(event)
{
  if(document.getElementById('form-input-size').value.match(/^[0-9]{1,7}$/) == null)
  {
    document.getElementById('form-input-size-correct').removeAttribute('style');
    document.getElementById('form-input-size-incorrect').style.display = 'block';
  }

  else
  {
    document.getElementById('form-input-size-incorrect').removeAttribute('style');
    document.getElementById('form-input-size-correct').style.display = 'block';

    checkFormDataToDisplayButton();
  }
}

/****************************************************************************************************/

function createTheMembersList(accounts)
{
  var list          = document.createElement('div');
  var search        = document.createElement('div');
  var background    = document.createElement('div');

  list              .setAttribute('class', 'list');
  background        .setAttribute('id', 'background');
  background        .setAttribute('class', 'background');
  background        .setAttribute('tag', 'off');
  
  search            .setAttribute('class', 'search');
  search            .innerHTML = `<input type='text' class='input' id='members-search' placeholder='Entrez une recherche' />`;

  list              .appendChild(search);

  var x = 0;

  var appendMembersLoop = () =>
  {
    var account       = document.createElement('div');
    var email         = document.createElement('div');
    var lastname      = document.createElement('div');
    var firstname     = document.createElement('div');
    var button        = document.createElement('div');

    email             .innerText = accounts[Object.keys(accounts)[x]].email;
    lastname          .innerText = accounts[Object.keys(accounts)[x]].lastname.toUpperCase();
    firstname         .innerText = accounts[Object.keys(accounts)[x]].firstname.charAt(0).toUpperCase() + accounts[Object.keys(accounts)[x]].firstname.slice(1).toLowerCase();
    button            .innerHTML = `<i class='fas fa-user-plus icon'></i>`;

    account           .setAttribute('class', 'account');
    email             .setAttribute('class', 'email');
    lastname          .setAttribute('class', 'lastname');
    firstname         .setAttribute('class', 'firstname');
    button            .setAttribute('class', 'add');

    account           .appendChild(email);
    account           .appendChild(lastname);
    account           .appendChild(firstname);
    account           .appendChild(button);

    list              .appendChild(account);

    if(Object.keys(accounts)[x += 1] != undefined) appendMembersLoop();

    else
    {
      background      .appendChild(list);
      document.body   .appendChild(background);
    }
  }

  if(Object.keys(accounts).length > 0) appendMembersLoop();

  else
  {
    var message       = document.createElement('div');
    message           .setAttribute('class', 'message');
    message           .innerText = 'Aucun membre';
    list              .appendChild(message);
  }
}

/****************************************************************************************************/