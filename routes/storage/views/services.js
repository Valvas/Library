'use strict'

const express                   = require('express')
const errors                    = require(`${__root}/json/errors`)
const constants                 = require(`${__root}/functions/constants`)
const commonAppStrings          = require(`${__root}/json/strings/common`)
const storageAppStrings         = require(`${__root}/json/strings/storage`)
const webContent                = require(`${__root}/json/share/webcontent`)
const commonAppsAccess          = require(`${__root}/functions/common/apps/access`)
const storageAppFilesGet        = require(`${__root}/functions/storage/files/get`)
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`)
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`)

var router = express.Router()

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  storageAppServicesRights.getRightsTowardsServices(req.session.account.id, req.app.get('mysqlConnector'), req.app.get('params'), (error, rights) =>
  {
    if(error != null)
    {
      res.render('storage/services/list',
      { 
        account: req.session.account, 
        strings: { common: commonAppStrings, storage: storageAppStrings },
        services: null,
        rights: null,
        error: { message: errors[error.code], detail: error.detail },
        webContent: webContent,
        location: 'services'
      })
    }

    else
    {
      storageAppServicesGet.getAllServices(req.app.get('mysqlConnector'), (error, services) =>
      {
        if(error == null)
        {
          res.render('storage/services/list',
          { 
            account: req.session.account, 
            strings: { common: commonAppStrings, storage: storageAppStrings },
            services: services,
            rights: rights,
            error: null,
            webContent: webContent,
            location: 'services'
          })
        }

        else
        {
          res.render('storage/services/list',
          { 
            account: req.session.account, 
            strings: { common: commonAppStrings, storage: storageAppStrings },
            services: null,
            rights: null,
            error: { message: errors[error.code], detail: error.detail },
            webContent: webContent,
            location: 'services'
          })
        }
      })
    }
  })
})

/****************************************************************************************************/

router.get('/:service', (req, res) =>
{
  req.app.get('databaseConnectionPool').getConnection((error, connection) =>
  {
    if(error) res.status(500).send({ message: errors[constants.SQL_SERVER_ERROR], detail: error.message });

    else
    {
      storageAppServicesGet.accessService(req.params.service, req.session.account.id, connection, req.app.get('params'), (error, service, rights, files) =>
      {
        connection.release();

        if(error != null)
        {
          res.render('storage/services/detail',
          {
            account: req.session.account,
            strings: { common: commonAppStrings, storage: storageAppStrings },
            rights: null,
            elements: null,
            error: { message: errors[error.code], detail: error.detail },
            service: null,
            webContent: webContent,
            location: 'services'
          });
        }

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
    }
  });
});

/****************************************************************************************************/

module.exports = router
