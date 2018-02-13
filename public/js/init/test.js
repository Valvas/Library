/****************************************************************************************************/

document.getElementById('back').addEventListener('click', backToForm);
document.getElementById('end').addEventListener('click', endConfiguration);

/****************************************************************************************************/

function endConfiguration(event)
{
  if(event.target.getAttribute('name') == 'true')
  {
    document.getElementById('container').style.filter = 'blur(3px)';

    var background = document.createElement('div');
    background.setAttribute('class', 'background');
    document.body.appendChild(background);

    var loader = document.createElement('div');
    loader.setAttribute('class', 'loader');

    var message = document.createElement('div');
    message.setAttribute('class', 'content');
    message.innerText = 'Vérification de la configuration en cours...';

    var icon = document.createElement('div');
    icon.setAttribute('class', 'icon');
    icon.innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

    loader.appendChild(icon);
    loader.appendChild(message);

    background.appendChild(loader);

    $.ajax(
    {
      type: 'GET', timeout: 20000, dataType: 'JSON', url: '/init/end', success: () => {},
      error: (xhr, status, error) => {}
        
    }).done((json) => 
    {
      if(json.result == false)
      {
        document.getElementById('container').removeAttribute('style');
        background.remove();
  
        var warning = document.createElement('div');
        warning.setAttribute('class', 'error');
        warning.innerText = `La configuration est incorrecte, l'application ne peut pas démarrer pour l'instant, veuillez corriger les erreurs.`;
        document.getElementById('warnings').insertBefore(warning, document.getElementById('warnings').children[0]);

        document.getElementById('end').setAttribute('name', 'false');
        document.getElementById('end').setAttribute('class', 'end inactive');
      }

      else
      {
        location = '/';
      }
    });
  }
}

/****************************************************************************************************/

function backToForm(event)
{
  location = '/init/form';
}

/****************************************************************************************************/

testDatabaseConnection((boolean) =>
{
  if(boolean == false)
  {
    var warning = document.createElement('div');
    warning.setAttribute('class', 'error');
    warning.innerText = `La connexion à la base de données est requise pour que l'application fonctionne, veuillez revenir au formulaire et corriger les erreurs.`;
    document.getElementById('warnings').appendChild(warning);
  }

  else
  {
    testStorageAccess((boolean) =>
    {
      if(boolean == false)
      {
        var warning = document.createElement('div');
        warning.setAttribute('class', 'error');
        warning.innerText = `L'accès au dossier de stockage des fichiers est requis pour que l'application fonctionne, veuillez revenir au formulaire et corriger les erreurs.`;
        document.getElementById('warnings').appendChild(warning);
      }

      else
      {
        testEmailTransporter((boolean) =>
        {
          if(boolean == false)
          {
            var warning = document.createElement('div');
            warning.setAttribute('class', 'warn');
            warning.innerText = `L'application peut fonctionner sans le module d'envoi des e-mails, cependant certaines fonctionnalités seront désactivées (exemple: récupération du mot de passe). Vous pouvez cliquer sur "Terminer" en bas pour mettre fin à la configuration ou revenir en arrière pour tenter de corriger le problème.`;
            document.getElementById('warnings').appendChild(warning);
          }

          else
          {
            var warning = document.createElement('div');
            warning.setAttribute('class', 'success');
            warning.innerText = `Tous les tests sont au vert, cliquez sur le bouton "Terminer" en bas pour mettre fin à la configuration et démarrer l'application.`;
            document.getElementById('warnings').appendChild(warning);
          }

          document.getElementById('end').setAttribute('name', 'true');
          document.getElementById('end').setAttribute('class', 'end active');
        });
      }
    });
  }
});

/****************************************************************************************************/

function testDatabaseConnection(callback)
{
  document.getElementById('database').setAttribute('class', 'pending');
  document.getElementById('database').children[1].innerHTML = `<i class='fas fa-spinner fa-pulse'></i>`;
  document.getElementById('database').children[2].innerText = 'En cours...';

  $.ajax(
  {
    type: 'GET', timeout: 60000, dataType: 'JSON', url: '/init/test/database', success: () => {},
    error: (xhr, status, error) => 
    {
      setTimeout(() =>
      {
        document.getElementById('database').setAttribute('class', 'failed');
        document.getElementById('database').children[1].innerHTML = `<i class='far fa-times-circle'></i>`;

        status == 'timeout' ? 
        document.getElementById('database').children[2].innerText = `La requête a pris trop de temps à s'exécuter` :
        document.getElementById('database').children[2].innerText = xhr.responseJSON.message;

        callback(false);
      }, 1000);
    }
    
  }).done((json) => 
  {
    setTimeout(() =>
    {
      document.getElementById('database').setAttribute('class', 'succedeed');
      document.getElementById('database').children[1].innerHTML = `<i class='far fa-check-circle'></i>`;
      document.getElementById('database').children[2].innerText = 'Connexion à la base de données réussie';
      callback(true);
    }, 1000);
  });
}

/****************************************************************************************************/

function testStorageAccess(callback)
{
  document.getElementById('storage').setAttribute('class', 'pending');
  document.getElementById('storage').children[1].innerHTML = `<i class='fas fa-spinner fa-pulse'></i>`;
  document.getElementById('storage').children[2].innerText = 'En cours...';

  $.ajax(
  {
    type: 'GET', timeout: 60000, dataType: 'JSON', url: '/init/test/storage', success: () => {},
    error: (xhr, status, error) => 
    { 
      setTimeout(() =>
      {
        document.getElementById('storage').setAttribute('class', 'failed');
        document.getElementById('storage').children[1].innerHTML = `<i class='far fa-times-circle'></i>`;

        status == 'timeout' ? 
        document.getElementById('storage').children[2].innerText = `La requête a pris trop de temps à s'exécuter` :
        document.getElementById('storage').children[2].innerText = xhr.responseJSON.message;
        
        callback(false);
      }, 1000);
    }
    
  }).done((json) => 
  {
    setTimeout(() =>
    {
      document.getElementById('storage').setAttribute('class', 'succedeed');
      document.getElementById('storage').children[1].innerHTML = `<i class='far fa-check-circle'></i>`;
      document.getElementById('storage').children[2].innerText = 'Accès établi au dossier de stockage';
      callback(true);
    }, 1000);
  });
}

/****************************************************************************************************/

function testEmailTransporter(callback)
{
  document.getElementById('transporter').setAttribute('class', 'pending');
  document.getElementById('transporter').children[1].innerHTML = `<i class='fas fa-spinner fa-pulse'></i>`;
  document.getElementById('transporter').children[2].innerText = 'En cours...';

  $.ajax(
  {
    type: 'GET', timeout: 60000, dataType: 'JSON', url: '/init/test/transporter', success: () => {},
    error: (xhr, status, error) => 
    { 
      setTimeout(() =>
      {
        document.getElementById('transporter').setAttribute('class', 'warning');
        document.getElementById('transporter').children[1].innerHTML = `<i class='fas fa-exclamation-triangle'></i>`;
        
        status == 'timeout' ? 
        document.getElementById('transporter').children[2].innerText = `La requête a pris trop de temps à s'exécuter` :
        document.getElementById('transporter').children[2].innerText = xhr.responseJSON.message;

        callback(false);
      }, 1000);
    }
    
  }).done((json) => 
  {
    setTimeout(() =>
    {
      document.getElementById('transporter').setAttribute('class', 'succedeed');
      document.getElementById('transporter').children[1].innerHTML = `<i class='far fa-check-circle'></i>`;
      document.getElementById('transporter').children[2].innerText = `Envoi de l'e-mail test réussi`;
      callback(true);
    }, 1000);
  });
}

/****************************************************************************************************/