'use strict';

const fs                    = require('fs');
const express               = require('express');
const jwt                   = require('jsonwebtoken');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const constants             = require(`${__root}/functions/constants`);
const initStart             = require(`${__root}/functions/init/start`);
const initFormat            = require(`${__root}/functions/init/format`);
const initStorage           = require(`${__root}/functions/init/storage`);
const initDatabase          = require(`${__root}/functions/init/database`);
const initTransporter       = require(`${__root}/functions/init/transporter`);
const commonAccountsCreate  = require(`${__root}/functions/common/accounts/create`);
const commonAccountsUpdate  = require(`${__root}/functions/common/accounts/update`);

const router = express.Router();

/****************************************************************************************************/

router.get('/logon', (req, res) =>
{
  if(req.app.get('params').ready) return res.render('block', { message: errors[constants.PAGE_NOT_FOUND], detail: null, link: '/' });
  
  if(req.app.locals.hasInitSession) return res.redirect('/init/form');
  
  return res.render('init/logon', { strings: { common: commonStrings } });
});

/****************************************************************************************************/

router.put('/logon', (req, res) =>
{
  if(req.app.get('params').ready) return res.status(404).send({ message: errors[constants.PAGE_NOT_FOUND], detail: null });

  if(req.body.password == undefined) return res.status(406).send({ message: 'Mot de passe manquant dans la requête' });

  fs.readFile(`${__root}/password`, 'utf8', (error, data) => 
  {
    if(req.body.password !== data) return res.status(406).send({ message: 'Le mot de passe est incorrect' });

    jwt.sign({ isAuthenticated: true }, req.app.get('params').tokenSecretKey, (error, token) =>
    {
      if(error != null) return res.status(406).send({ message: error.message, detail: null });
      
      return res.status(200).send({ token: token, maxAge: (60 * 60) });
    });
  });
});

/****************************************************************************************************/

router.get('/form', (req, res) =>
{
  if(req.app.get('params').ready) return res.redirect('/');

  if(req.app.locals.hasInitSession == false) return res.redirect('/init/logon');

  return res.render('init/form', { data: req.app.get('params'), strings: { common: commonStrings } });
});

/****************************************************************************************************/

router.put('/form', (req, res) =>
{
  if(req.app.get('params').ready) return res.status(404).send({ message: errors[constants.PAGE_NOT_FOUND], detail: null });

  if(req.app.locals.hasInitSession == false) return res.status(401).send({ message: errors[constants.AUTHENTICATION_REQUIRED], detail: null });

  initFormat.checkConfigDataFormat(req.body, req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: error.message });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.get('/test', (req, res) =>
{
  if(req.app.get('params').ready) return res.redirect('/');

  if(req.app.locals.hasInitSession == false) return res.redirect('/init/logon');

  return res.render('init/test', { strings: { common: commonStrings } });
});

/****************************************************************************************************/

router.get('/test/database', (req, res) =>
{
  if(req.app.get('params').ready) return res.status(404).send({ message: errors[constants.PAGE_NOT_FOUND], detail: null });

  if(req.app.locals.hasInitSession == false) return res.status(401).send({ message: errors[constants.AUTHENTICATION_REQUIRED], detail: null });

  initDatabase.checkAccessToDatabase(req.app.get('params').database, (error) =>
  {
    if(error == null)
    {
      req.app.get('params').init.servicesStarted.database = true;
      res.status(200).send({  });
    }
  
    else
    {
      req.app.get('params').init.servicesStarted.database = false;
      res.status(error.status).send({ message: errors[error.code] });
    }
  });
});

/****************************************************************************************************/

router.get('/test/storage', (req, res) =>
{
  if(req.app.get('params').ready) return res.status(404).send({ message: errors[constants.PAGE_NOT_FOUND], detail: null });

  if(req.app.locals.hasInitSession == false) return res.status(401).send({ message: errors[constants.AUTHENTICATION_REQUIRED], detail: null });

  initStorage.checkAccessToRootStorage(req.app.get('params'), (error) =>
  {
    if(error == null)
    {
      req.app.get('params').init.servicesStarted.storage = true;
      res.status(200).send({  });
    }

    else
    {
      req.app.get('params').init.servicesStarted.storage = false;
      res.status(error.status).send({ result: false, message: error.message });
    }
  });
});

/****************************************************************************************************/

router.get('/test/transporter', (req, res) =>
{
  if(req.app.get('params').ready) return res.status(404).send({ message: errors[constants.PAGE_NOT_FOUND], detail: null });

  if(req.app.locals.hasInitSession == false) return res.status(401).send({ message: errors[constants.AUTHENTICATION_REQUIRED], detail: null });

  initTransporter.checkEmailSending(req.app.get('params'), (error) =>
  {
    if(error == null)
    {
      req.app.get('params').init.servicesStarted.transporter = true;
      res.status(200).send({  });
    }

    else
    {
      req.app.get('params').init.servicesStarted.transporter = false;
      res.status(error.status).send({ result: false, message: error.message });
    }
  });
});

/****************************************************************************************************/

router.get('/end', (req, res) =>
{
  if(req.app.get('params').init.requiredServicesToStart.database == true && req.app.get('params').init.servicesStarted.database == false) return res.status(200).send({ result: false, message: 'Database connection is required' });

  if(req.app.get('params').init.requiredServicesToStart.storage == true && req.app.get('params').init.servicesStarted.storage == false) return res.status(200).send({ result: false, message: 'Storage access is required' });

  if(req.app.get('params').init.requiredServicesToStart.transporter == true && req.app.get('params').init.servicesStarted.transporter == false) return res.status(200).send({ result: false, message: 'Email access is required' });

  var params = req.app.get('params');
  params.ready = true;
  
  fs.writeFile(`${__root}/json/params.json`, JSON.stringify(params), (error) =>
  {
    if(error) return res.status(500).send({ message: 'Could not write new configuration in file' });

    initStart.startApp(req.app, () =>
    {
      res.status(200).send({  });
    });
  });
});

/****************************************************************************************************/

module.exports = router;