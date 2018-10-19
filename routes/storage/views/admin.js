'use strict'

const express                   = require('express');
const errors                    = require(`${__root}/json/errors`);
const constants                 = require(`${__root}/functions/constants`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const commonAccessGet           = require(`${__root}/functions/common/access/get`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppExtensionsGet   = require(`${__root}/functions/storage/extensions/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('storage/admin/home',
  { 
    account: req.app.locals.account,
    strings: { common: commonAppStrings, storage: storageAppStrings },
    location: 'administration',
    adminLocation: 'home',
    storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
    storageAdminRights: req.app.locals.storageAdminRights
  });
});

/****************************************************************************************************/

router.get('/account-levels', (req, res) =>
{
  commonAccessGet.getAccountsThatHaveAccessToProvidedApp('storage', req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else if(accounts.length === 0)
    {
      res.render('storage/admin/accountsLevel',
      { 
        account: req.app.locals.account,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        location: 'administration',
        adminLocation: 'level',
        storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
        storageAdminRights: req.app.locals.storageAdminRights,
        accountsToManage: []
      });
    }

    else
    {
      var index = 0;

      var browseAccounts = () =>
      {
        storageAppAdminGet.getAccountAdminLevel(accounts[index].uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, adminLevel) =>
        {
          if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

          else
          {
            accounts[index].level = adminLevel;

            if(accounts[index += 1] != undefined) browseAccounts();

            else
            {
              res.render('storage/admin/accountsLevel/home',
              { 
                account: req.app.locals.account,
                strings: { common: commonAppStrings, storage: storageAppStrings },
                location: 'administration',
                adminLocation: 'level',
                storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
                storageAdminRights: req.app.locals.storageAdminRights,
                accountsToManage: accounts
              });
            }
          }
        });
      }

      browseAccounts();
    }
  });
});

/****************************************************************************************************/

router.get('/account-levels/:accountUuid', (req, res) =>
{
  commonAccountsGet.checkIfAccountExistsFromUuid(req.params.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else if(accountExists == false) res.render('block', { message: errors[constants.ACCOUNT_NOT_FOUND], detail: null, link: req.headers.referer });

    else
    {
      storageAppAdminGet.getAccountAdminLevel(req.params.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, adminLevel) =>
      {
        if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        else
        {
          var account = {};

          account.uuid = accountData.uuid;
          account.email = accountData.email;
          account.firstname = accountData.firstname;
          account.lastname = accountData.lastname;
          account.level = adminLevel;

          res.render('storage/admin/accountsLevel/account',
          { 
            account: req.app.locals.account,
            strings: { common: commonAppStrings, storage: storageAppStrings },
            location: 'administration',
            adminLocation: 'level',
            storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
            storageAdminRights: req.app.locals.storageAdminRights,
            accountToManage: account
          });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.get('/services', (req, res) =>
{
  storageAppServicesGet.getServicesData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, servicesDetail) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else
    {
      res.render('storage/admin/services/home',
      {
        account: req.app.locals.account,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        location: 'administration',
        adminLocation: 'services',
        storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
        storageAdminRights: req.app.locals.storageAdminRights,
        services: servicesDetail
      });
    }
  });
});

/****************************************************************************************************/

router.get('/services-rights', (req, res) =>
{
  storageAppServicesGet.getServicesData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, servicesDetail) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else
    {
      res.render('storage/admin/servicesRights/home',
      {
        account: req.app.locals.account,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        location: 'administration',
        adminLocation: 'rights',
        storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
        storageAdminRights: req.app.locals.storageAdminRights,
        services: servicesDetail
      });
    }
  });
});

/****************************************************************************************************/

router.get('/services/update/:service', (req, res) =>
{
  storageAppServicesGet.checkIfServiceExists(req.params.service, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExists, serviceData) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else if(serviceExists == false) res.render('block', { message: errors[constants.SERVICE_NOT_FOUND], detail: null, link: req.headers.referer });

    else
    {
      storageAppExtensionsGet.getAllExtensions(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, extensions) =>
      {
        if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        else
        {
          res.render('storage/admin/services/update',
          {
            account: req.app.locals.account,
            strings: { common: commonAppStrings, storage: storageAppStrings },
            location: 'administration',
            adminLocation: 'services',
            storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
            storageAdminRights: req.app.locals.storageAdminRights,
            extensions: extensions,
            serviceData: serviceData
          });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.get('/services/create', (req, res) =>
{
  if(req.app.locals.storageAdminRights[req.app.locals.storageAdminAccountLevel].createServices == false)
  {
    res.render('block', { message: errors[constants.RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE], detail: null, link: req.headers.referer });
  }

  else
  {
    storageAppExtensionsGet.getAllExtensions(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, extensions) =>
    {
      if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      else
      {
        res.render('storage/admin/services/create',
        {
          account: req.app.locals.account,
          strings: { common: commonAppStrings, storage: storageAppStrings },
          location: 'administration',
          adminLocation: 'services',
          storageAdminAccountLevel: req.app.locals.storageAdminAccountLevel,
          storageAdminRights: req.app.locals.storageAdminRights,
          extensions: extensions
        });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;