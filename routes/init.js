'use strict';

const fs                = require('fs');
const express           = require('express');
const errors            = require(`${__root}/json/errors`);
const constants         = require(`${__root}/functions/constants`);
const initStart         = require(`${__root}/functions/init/start`);
const initFormat        = require(`${__root}/functions/init/format`);
const initStorage       = require(`${__root}/functions/init/storage`);
const initDatabase      = require(`${__root}/functions/init/database`);
const initTransporter   = require(`${__root}/functions/init/transporter`);

const router = express.Router();

/****************************************************************************************************/

router.get('/logon', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.session.identified == true ? res.redirect('/init/form') : res.render('init/logon');
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.post('/logon', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.body.password == undefined ? res.status(406).send({ result: false, message: 'Mot de passe manquant dans la requête' }) :

    fs.readFile(`${__root}/password`, (err, data) => 
    {
      if(req.body.password != data) res.status(406).send({ result: false, message: 'Le mot de passe est incorrect' });

      else
      {
        req.session.identified = true;
        res.status(200).send({ result: true });
      }
    });
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/form', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.session.identified == true ? res.render('init/form', { data: req.app.get('params') }) : res.redirect('/init/logon');
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.post('/form', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') :

    initFormat.checkConfigDataFormat(req.body, req.app.get('params'), (error) =>
    {
      error == null ? res.status(200).send({ result: true }) : res.status(error.status).send({ result: false, message: error.message });
    });
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/test', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') : res.render('init/test');
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/test/database', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') :

    initDatabase.checkAccessToDatabase(req.app.get('params').database, (error) =>
    {
      if(error == null)
      {
        req.app.get('params').init.servicesStarted.database = true;
        res.status(200).send({ result: true });
      }
    
      else
      {
        req.app.get('params').init.servicesStarted.database = false;
        res.status(500).send({ result: false, message: error.message });
      }
    });
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/test/storage', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') :

    initStorage.checkAccessToRootStorage(req.app.get('params'), (error) =>
    {
      if(error == null)
      {
        req.app.get('params').init.servicesStarted.storage = true;
        res.status(200).send({ result: true });
      }

      else
      {
        req.app.get('params').init.servicesStarted.storage = false;
        res.status(error.status).send({ result: false, message: error.message });
      }
    });
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/test/transporter', (req, res) =>
{
  if(req.app.get('params').ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') :

    initTransporter.checkEmailSending(req.app.get('params'), (error) =>
    {
      if(error == null)
      {
        req.app.get('params').init.servicesStarted.transporter = true;
        res.status(200).send({ result: true });
      }

      else
      {
        req.app.get('params').init.servicesStarted.transporter = false;
        res.status(error.status).send({ result: false, message: error.message });
      }
    });
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/end', (req, res) =>
{
  if(req.app.get('params').init.requiredServicesToStart.database == true && req.app.get('params').init.servicesStarted.database == false) res.status(200).send({ result: false, message: 'Database connection is required' });

  else if(req.app.get('params').init.requiredServicesToStart.storage == true && req.app.get('params').init.servicesStarted.storage == false) res.status(200).send({ result: false, message: 'Storage access is required' });

  else if(req.app.get('params').init.requiredServicesToStart.transporter == true && req.app.get('params').init.servicesStarted.transporter == false) res.status(200).send({ result: false, message: 'Email access is required' });
  
  else
  {
    setTimeout(() => 
    { 
      var params = req.app.get('params');
      params.ready = true;
      
      fs.writeFile(`${__root}/json/params.json`, JSON.stringify(params), (err) =>
      {
        if(err) res.status(500).send({ result: false, message: 'Could not write new configuration in file' });

        else
        {
          initStart.startApp(req.app, () =>
          {
            res.status(200).send({ result: true });
          });
        }
      });  
    }, 3000);
  }
});

/****************************************************************************************************/

module.exports = router;