'use strict'

const express                   = require('express');
const errors                    = require(`${__root}/json/errors`);
const constants                 = require(`${__root}/functions/constants`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const webContent                = require(`${__root}/json/share/webcontent`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const commonAccessGet           = require(`${__root}/functions/common/access/get`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesExtensions = require(`${__root}/functions/storage/files/extensions`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('storage/admin/home',
  { 
    account: req.app.locals.account,
    strings: { common: commonAppStrings, storage: storageAppStrings },
    webContent: webContent,
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
        webContent: webContent,
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
                webContent: webContent,
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

          account.email = accountData.email;
          account.firstname = accountData.firstname;
          account.lastname = accountData.lastname;
          account.level = adminLevel;

          res.render('storage/admin/accountsLevel/account',
          { 
            account: req.app.locals.account,
            strings: { common: commonAppStrings, storage: storageAppStrings },
            webContent: webContent,
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
    storageAppAdminGet.getServicesDetailForConsultation(req.app.get('databaseConnectionPool'), (error, servicesDetail) =>
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
  storageAppServicesGet.checkIfServiceExists(req.params.service, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExists, serviceData) =>
  {
    if(error != null)
    {
      res.render('storage/admin/services/detail', { account: req.session.account, error: error, service: null, strings: { common: commonAppStrings, storage: storageAppStrings }, webContent: webContent, location: 'administration', adminLocation: 'services' });
    }

    else if(serviceExists == false)
    {
      res.render('storage/admin/services/detail', { account: req.session.account, error: { status: 404, code: constants.SERVICE_NOT_FOUND, detail: null }, service: null, strings: { common: commonAppStrings, storage: storageAppStrings }, webContent: webContent, location: 'administration', adminLocation: 'services' });
    }

    else
    {
      storageAppServicesGet.getAuthorizedExtensionsForService(req.params.service, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExtensions, allExtensions) =>
      {
        if(error != null)
        {
          res.render('storage/admin/services/detail', { account: req.session.account, error: error, service: null, strings: { common: commonAppStrings, storage: storageAppStrings }, webContent: webContent, location: 'administration', adminLocation: 'services' });
        }

        else
        {
          res.render('storage/admin/services/detail', { account: req.session.account, error: null, service: { serviceData: serviceData, serviceExtensions: serviceExtensions, allExtensions: allExtensions }, strings: { common: commonAppStrings, storage: storageAppStrings }, webContent: webContent, location: 'administration', adminLocation: 'services' });
        }
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