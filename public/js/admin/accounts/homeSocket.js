var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('adminAppAccountsHomeJoin');
});

/****************************************************************************************************/

socket.on('accountCreated', (error, account) =>
{
  if(error == null)
  {
    var line              = document.createElement('div');
    var email             = document.createElement('div');
    var lastname          = document.createElement('div');
    var firstname         = document.createElement('div');
    var suspended         = document.createElement('div');

    email                 .innerText = account.email;
    lastname              .innerText = account.lastname.toUpperCase();
    firstname             .innerText = `${account.firstname.charAt(0).toUpperCase()}${account.firstname.slice(1).toLowerCase()}`;
    suspended             .innerText = account.suspended ? 'Oui' : 'Non';

    line                  .setAttribute('class', 'account');
    email                 .setAttribute('class', 'email');
    lastname              .setAttribute('class', 'lastname');
    firstname             .setAttribute('class', 'firstname');
    suspended             .setAttribute('class', `suspended ${account.suspended ? 'true' : 'false'}`);

    line                  .setAttribute('name', account.uuid);
    line                  .setAttribute('tag', '0');

    line                  .appendChild(email);
    line                  .appendChild(lastname);
    line                  .appendChild(firstname);
    line                  .appendChild(suspended);

    line                  .addEventListener('click', openAccountDetail);

    document.getElementById('account-list').insertBefore(line, document.getElementById('account-list').children[0]);

    var popup             = document.createElement('div');

    popup                 .setAttribute('class', 'blue');
    popup                 .innerText = 'Un compte a été créé';

    document.getElementById('account-list-block-popup').appendChild(popup);

    setTimeout(() =>
    {
      popup.remove();
    }, 4000);

    updateAccountListPages();
  }
});

/****************************************************************************************************/

socket.on('accountModified', (error, account) =>
{
  if(error == null)
  {
    var accounts = document.getElementById('account-list').children;

    var x = 0;

    var browseAccountsLoop = () =>
    {
      if(accounts[x].getAttribute('name') == account.uuid)
      {
        accounts[x].children[0].innerText = account.email;
        accounts[x].children[1].innerText = account.lastname.toUpperCase();
        accounts[x].children[2].innerText = account.firstname.charAt(0).toUpperCase() + account.firstname.slice(1).toLowerCase();

        if(account.suspended == 0)
        {
          accounts[x].children[3].innerText = 'Non';
          accounts[x].children[3].setAttribute('class', 'suspended false');
        }

        else
        {
          accounts[x].children[3].innerText = 'Oui';
          accounts[x].children[3].setAttribute('class', 'suspended true');
        }
      }

      else
      {
        if(accounts[x += 1] != undefined) browseAccountsLoop();
      }
    }

    if(accounts[x] != undefined) browseAccountsLoop();

    var popup             = document.createElement('div');

    popup                 .setAttribute('class', 'blue');
    popup                 .innerText = `Le compte "${account.email}" a été modifié`;

    document.getElementById('account-list-block-popup').appendChild(popup);

    setTimeout(() =>
    {
      popup.remove();
    }, 4000);

    updateAccountListPages();
  }
});

/****************************************************************************************************/