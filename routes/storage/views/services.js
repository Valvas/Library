'use strict'

const express                   = require('express')
const errors                    = require(`${__root}/json/errors`)
const constants                 = require(`${__root}/functions/constants`)
const commonAppStrings          = require(`${__root}/json/strings/common`)
const storageAppStrings         = require(`${__root}/json/strings/storage`)
const webContent                = require(`${__root}/json/share/webcontent`)
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`)
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`)

var router = express.Router()

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  storageAppServicesRights.getRightsTowardsServices(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rights) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else
    {
      storageAppServicesGet.getServicesData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, services) =>
      {
        if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        else
        {
          res.render('storage/services/list',
          { 
            account: req.app.locals.account, 
            strings: { common: commonAppStrings, storage: storageAppStrings },
            services: services,
            rights: rights,
            error: null,
            webContent: webContent,
            location: 'services'
          });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.get('/:service', (req, res) =>
{
  storageAppServicesGet.accessService(req.params.service, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, service, rights, files) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else
    {
      res.render('storage/services/detail',
      {
        account: req.session.account,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        rights: rights,
        elements: files,
        error: null,
        service: service,
        webContent: webContent,
        location: 'services'
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router
