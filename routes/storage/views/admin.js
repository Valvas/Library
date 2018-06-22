'use strict'

const express                   = require('express');
const params                    = require(`${__root}/json/params`);
const errors                    = require(`${__root}/json/errors`);
const constants                 = require(`${__root}/functions/constants`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const webContent                = require(`${__root}/json/share/webcontent`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesExtensions = require(`${__root}/functions/storage/files/extensions`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('storage/admin/home',
  { 
    account: req.session.account,
    rights: req.app.locals.rights,
    strings: { common: commonAppStrings, storage: storageAppStrings },
    webContent: webContent,
    location: 'administration',
    adminLocation: 'home'
  });
});

/****************************************************************************************************/

router.get('/services', (req, res) =>
{
  if(req.app.locals.rights.access_services == 0)
  {
    res.render('block', { message: errors[constants.RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE] });
  }

  else
  {
    storageAppAdminGet.getServicesDetailForConsultation(req.app.get('databaseConnectionPool'), (error, servicesDetail) =>
    {
      if(error != null)
      {
        res.render('storage/admin/services/list',
        {
          account: req.session.account,
          rights: req.app.locals.rights,
          error: { message: errors[error.code], detail: error.detail },
          services: null,
          strings: { common: commonAppStrings, storage: storageAppStrings },
          webContent: webContent,
          location: 'administration',
          adminLocation: 'services'
        });
      }

      else
      {
        res.render('storage/admin/services/list',
        {
          account: req.session.account,
          rights: req.app.locals.rights,
          error: null,
          services: servicesDetail,
          strings: { common: commonAppStrings, storage: storageAppStrings },
          webContent: webContent,
          location: 'administration',
          adminLocation: 'services'
        });
      }
    });
  }
});

/****************************************************************************************************/

router.get('/services-rights', (req, res) =>
{
  if(req.app.locals.rights.consult_services_rights == 0)
  {
    res.render('block', { message: errors[constants.RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE] });
  }

  else
  {
    storageAppAdminGet.getServicesDetailForConsultation(req.app.get('mysqlConnector'), (error, servicesDetail) =>
    {
      if(error != null)
      {
        res.render('storage/admin/servicesRights/home',
        {
          account: req.session.account,
          rights: req.app.locals.rights,
          error: { message: errors[error.code], detail: error.detail },
          services: null,
          strings: { common: commonAppStrings, storage: storageAppStrings },
          webContent: webContent,
          location: 'administration',
          adminLocation: 'rights'
        });
      }

      else
      {
        res.render('storage/admin/servicesRights/home',
        {
          account: req.session.account,
          rights: req.app.locals.rights,
          error: null,
          services: servicesDetail,
          strings: { common: commonAppStrings, storage: storageAppStrings },
          webContent: webContent,
          location: 'administration',
          adminLocation: 'rights'
        });
      }
    });
  }
});

/****************************************************************************************************/

router.get('/services/detail/:service', (req, res) =>
{
  storageAppServicesGet.getServiceUsingName(req.params.service, req.app.get('mysqlConnector'), (error, service) =>
  {
    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    else
    {
      res.render('storage/admin/services/detail',
      {
        account: req.session.account,
        error: null,
        service: service,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        webContent: webContent,
        location: 'administration',
        adminLocation: 'services'
      });
    }
  });
});

/****************************************************************************************************/

router.get('/services/form', (req, res) =>
{
  if(req.app.locals.rights.create_services == 0)
  {
    res.render('block', { message: errors[constants.RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE] });
  }

  else
  {
    storageAppFilesExtensions.getExtensions(req.app.get('databaseConnectionPool'), req.app.get('params').database.storage, (error, extensions) =>
    {
      if(error != null)
      {
        res.render('storage/admin/services/form',
        {
          account: req.session.account,
          rights: req.app.locals.rights,
          error: { message: errors[error.code], detail: error.detail },
          strings: { common: commonAppStrings, storage: storageAppStrings },
          webContent: webContent,
          location: 'administration',
          adminLocation: 'services',
          extensions: null
        });
      }

      else
      {
        res.render('storage/admin/services/form',
        {
          account: req.session.account,
          rights: req.app.locals.rights,
          error: null,
          strings: { common: commonAppStrings, storage: storageAppStrings },
          webContent: webContent,
          location: 'administration',
          adminLocation: 'services',
          extensions: extensions
        });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;