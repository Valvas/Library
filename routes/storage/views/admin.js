'use strict'

const express                   = require('express');
const errors                    = require(`${__root}/json/errors`);
const constants                 = require(`${__root}/functions/constants`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const storageAppAccessGet       = require(`${__root}/functions/storage/access/get`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppExtensionsGet   = require(`${__root}/functions/storage/extensions/get`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

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
    isAdmin: req.app.locals.isAdmin
  });
});

/****************************************************************************************************/

router.get('/account-admin', (req, res) =>
{
  if(req.app.locals.isAdmin == false) return res.render('block', { message: errors[constants.IS_NOT_APP_ADMIN], detail: null, link: '/storage' });

  storageAppAccessGet.getAccountsThatHaveAccessToTheApp(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    if(accounts.length === 0) return res.render('storage/admin/accountsAdmin',
    { 
      account: req.app.locals.account,
      strings: { common: commonAppStrings, storage: storageAppStrings },
      location: 'administration',
      adminLocation: 'accoutnAdmin',
      accountsToManage: []
    });

    var index = 0;
    var accountsToManage = [];

    var browseAccounts = () =>
    {
      commonAccountsGet.checkIfAccountExistsFromUuid(accounts[index], req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
      {
        if(error != null || accountExists == false)
        {
          if(accounts[index += 1] != undefined) return browseAccounts();

          return res.render('storage/admin/accountsAdmin',
          { 
            account: req.app.locals.account,
            strings: { common: commonAppStrings, storage: storageAppStrings },
            location: 'administration',
            adminLocation: 'accoutnAdmin',
            accountsToManage: accountsToManage
          });
        }

        storageAppAdminGet.checkIfAccountIsAdmin(accounts[index], req.app.get('databaseConnectionPool'), req.app.get('params'), (error, isAdmin) =>
        {
          if(error != null)
          {
            if(accounts[index += 1] != undefined) return browseAccounts();

            return res.render('storage/admin/accountsAdmin',
            { 
              account: req.app.locals.account,
              strings: { common: commonAppStrings, storage: storageAppStrings },
              location: 'administration',
              adminLocation: 'accoutnAdmin',
              accountsToManage: accountsToManage
            });
          }

          accountsToManage.push({ uuid: accountData.uuid, email: accountData.email, lastname: accountData.lastname, firstname: accountData.firstname, isAdmin: isAdmin });

          if(accounts[index += 1] != undefined) return browseAccounts();

          return res.render('storage/admin/accountsAdmin',
          { 
            account: req.app.locals.account,
            strings: { common: commonAppStrings, storage: storageAppStrings },
            location: 'administration',
            adminLocation: 'accoutnAdmin',
            accountsToManage: accountsToManage
          });
        });
      });
    }

    browseAccounts();
  });
});

/****************************************************************************************************/

router.get('/services-management', (req, res) =>
{
  if(req.app.locals.isAdmin == false) return res.render('block', { message: errors[constants.IS_NOT_APP_ADMIN], detail: null, link: '/storage' });

  storageAppServicesGet.getServicesData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, servicesDetail) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    res.render('storage/admin/services/home',
    {
      account: req.app.locals.account,
      strings: { common: commonAppStrings, storage: storageAppStrings },
      location: 'administration',
      adminLocation: 'servicesManagement',
      services: servicesDetail
    });
  });
});

/****************************************************************************************************/

router.get('/services-rights', (req, res) =>
{
  storageAppServicesGet.getServicesData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, servicesDetail) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    storageAppAdminGet.getServicesThatAccountIsAdmin(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, services) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      for(var service in servicesDetail)
      {
        services.includes(service)
        ? servicesDetail[service].admin = true
        : servicesDetail[service].admin = false;
      }

      res.render('storage/admin/servicesRights/home',
      {
        account: req.app.locals.account,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        location: 'administration',
        adminLocation: 'rights',
        isAdmin: req.app.locals.isAdmin,
        services: servicesDetail
      });
    });
  });
});

/****************************************************************************************************/

router.get('/services-rights/:serviceUuid', (req, res) =>
{
  storageAppAdminGet.checkIfAccountIsAdminOnService(req.app.locals.account.uuid, req.params.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, isAdminOnService) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    if(req.app.locals.isAdmin == false && isAdminOnService == false) res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/storage/admin/services-rights' });

    storageAppServicesGet.checkIfServiceExistsFromUuid(req.params.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExists, serviceData) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      if(serviceExists == false) return res.render('block', { message: errors[constants.SERVICE_NOT_FOUND], detail: null, link: req.headers.referer });

      storageAppAccessGet.getAccountsThatHaveAccessToTheApp(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
      {
        if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        var index = 0, accountsToManage = [];

        var browseAccountsToGetData = () =>
        {
          commonAccountsGet.checkIfAccountExistsFromUuid(accounts[index], req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
          {
            if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

            if(accountExists == false) return res.render('block', { message: errors[constants.ACCOUNT_NOT_FOUND], detail: null, link: req.headers.referer });
            
            accountsToManage.push({ uuid: accountData.uuid, email: accountData.email, lastname: accountData.lastname, firstname: accountData.firstname });

            if(accounts[index += 1] != undefined) return browseAccountsToGetData();

            return res.render('storage/admin/servicesRights/service',
            {
              account: req.app.locals.account,
              strings: { common: commonAppStrings, storage: storageAppStrings },
              location: 'administration',
              adminLocation: 'rights',
              serviceData: serviceData,
              accountsToManage: accountsToManage
            });
          });
        }

        browseAccountsToGetData();
      });
    });
  });
});

/****************************************************************************************************/

router.get('/services-management/update/:service', (req, res) =>
{
  if(req.app.locals.isAdmin == false) return res.render('block', { message: errors[constants.IS_NOT_APP_ADMIN], detail: null, link: '/storage' });

  storageAppServicesGet.checkIfServiceExistsFromUuid(req.params.service, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExists, serviceData) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    if(serviceExists == false) return res.render('block', { message: errors[constants.SERVICE_NOT_FOUND], detail: null, link: req.headers.referer });

    storageAppExtensionsGet.getAllExtensions(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, extensions) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      res.render('storage/admin/services/update',
      {
        account: req.app.locals.account,
        strings: { common: commonAppStrings, storage: storageAppStrings },
        location: 'administration',
        adminLocation: 'servicesManagement',
        extensions: extensions,
        serviceData: serviceData
      });
    });
  });
});

/****************************************************************************************************/

router.get('/services-management/create', (req, res) =>
{
  if(req.app.locals.isAdmin == false) return res.render('block', { message: errors[constants.IS_NOT_APP_ADMIN], detail: null, link: '/storage' });

  storageAppExtensionsGet.getAllExtensions(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, extensions) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    res.render('storage/admin/services/create',
    {
      account: req.app.locals.account,
      strings: { common: commonAppStrings, storage: storageAppStrings },
      location: 'administration',
      adminLocation: 'servicesManagement',
      extensions: extensions
    });
  });
});

/****************************************************************************************************/

module.exports = router;