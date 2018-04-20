/****************************************************************************************************/

if(document.getElementById('exit-button')) document.getElementById('exit-button').addEventListener('click', openPrompt);

/****************************************************************************************************/

function openPrompt(event)
{
  if(!document.getElementById('exit-background'))
  {
    document.getElementById('blur').style.filter = 'blur(4px)';

    var background  = document.createElement('div');
    var prompt      = document.createElement('div');
    var title       = document.createElement('div');
    var message     = document.createElement('div');
    var confirm     = document.createElement('button');
    var cancel      = document.createElement('button');

    background      .setAttribute('class', 'background');
    prompt          .setAttribute('class', 'prompt');
    title           .setAttribute('class', 'title');
    message         .setAttribute('class', 'message');
    confirm         .setAttribute('class', 'confirm');
    cancel          .setAttribute('class', 'cancel');

    background      .setAttribute('id', 'exit-background');
    confirm         .setAttribute('id', 'exit-prompt-confirm');
    cancel          .setAttribute('id', 'exit-prompt-cancel');

    title           .innerText = 'Quitter';
    message         .innerText = `Êtes-vous sûr(e) de vouloir quitter l'application ?`;
    confirm         .innerText = 'Oui';
    cancel          .innerText = 'Non';

    confirm         .addEventListener('click', exitApp);
    cancel          .addEventListener('click', closePrompt);

    prompt          .appendChild(title);
    prompt          .appendChild(message);
    prompt          .appendChild(confirm);
    prompt          .appendChild(cancel);
    background      .appendChild(prompt);

    $(background)   .hide().appendTo(document.body);
    $(background)   .fadeIn(250);
  }
}

/****************************************************************************************************/

function exitApp(event)
{
  location = '/home';
}

/****************************************************************************************************/

function closePrompt(event)
{
  $(document.getElementById('exit-background')).fadeOut(250, () => { document.getElementById('exit-background').remove(); });
  document.getElementById('blur').removeAttribute('style');
}

/****************************************************************************************************/