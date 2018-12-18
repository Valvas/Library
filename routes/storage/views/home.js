'use strict'

const express                   = require('express');
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  storageAppServicesGet.getServicesData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, services) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    var index = 0;

    var returnData = () =>
    {
      res.render('storage/home',
      { 
        account: req.app.locals.account,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        services: services,
        location: 'services'
      });
    }

    var browseServices = () =>
    {
      storageAppServicesRights.getRightsTowardsService(Object.keys(services)[index], req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceRights) =>
      {
        if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        services[Object.keys(services)[index]].hasAccess = req.app.locals.isAdmin == true || serviceRights.accessService == true || serviceRights.isAdmin == true;

        Object.keys(services)[index += 1] != undefined
        ? browseServices()
        : returnData();
      });
    }

    Object.keys(services).length > 0
    ? browseServices()
    : returnData();
  });
});

/****************************************************************************************************/

module.exports = router;