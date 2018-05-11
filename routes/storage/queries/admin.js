'use strict'

const express                   = require('express');
const params                    = require(`${__root}/json/params`);
const errors                    = require(`${__root}/json/errors`);
const success                   = require(`${__root}/json/success`);
const constants                 = require(`${__root}/functions/constants`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const accessGet                 = require(`${__root}/functions/access/get`);
const accountsGet               = require(`${__root}/functions/accounts/get`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppAdminServices   = require(`${__root}/functions/storage/admin/services`);

var router = express.Router();

/****************************************************************************************************/

router.post('/give-access-to-a-service', (req, res) =>
{
  if(req.body.accounts == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Account(s) is/are missing from the request' });

  else if(req.body.serviceName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service is missing from the request' });

  else
  {
    const accounts = JSON.parse(req.body.accounts);

    storageAppServicesGet.getServiceUsingName(req.body.serviceName, req.app.get('mysqlConnector'), (error, service) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        var x = 0;

        var browseAccounts = () =>
        {
          accountsGet.getAccountUsingUUID(accounts[Object.keys(accounts)[x]], req.app.get('mysqlConnector'), (error, account) =>
          {
            if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

            else
            {
              storageAppAdminServices.addMembersToService(service.id, { 0: { id: account.id, comment: false, upload: false, download: false, remove: false } }, req.session.account.id, req.app.get('mysqlConnector'), (error) =>
              {
                if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                else if(Object.keys(accounts)[x += 1] != undefined) browseAccounts();

                else
                {
                  res.status(200).send({ result: true });
                }
              });
            }
          });
        }

        if(Object.keys(accounts)[x] != undefined) browseAccounts();

        else
        {
          res.status(200).send({ result: true });
        }
      }
    });
  }
});

/****************************************************************************************************/

router.post('/remove-access-to-a-service', (req, res) =>
{
  if(req.body.accounts == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Account(s) is/are missing from the request' });

  else if(req.body.serviceName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service is missing from the request' });

  else
  {
    const accounts = JSON.parse(req.body.accounts);

    storageAppServicesGet.getServiceUsingName(req.body.serviceName, req.app.get('mysqlConnector'), (error, service) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        storageAppAdminServices.removeMembersFromAService(service.id, accounts, req.session.account.id, req.app.get('mysqlConnector'), (error) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          else
          {
            res.status(200).send({ result: true });
          }
        });
      }
    });
  }
});

/****************************************************************************************************/

router.get('/get-accounts-that-have-access-to-the-app', (req, res) =>
{
  if(req.app.locals.rights.create_services == 0) res.status(403).send({ result: false, message: errors[constants.RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE] });

  else
  {
    accessGet.getAccountsThatHaveAccessToStorageApp(req.app.get('mysqlConnector'), (error, accounts) =>
    {
      if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

      else
      {
        res.status(200).send({ result: true, accounts: accounts });
      }
    });
  }
});

/****************************************************************************************************/

router.get('/get-min-and-max-file-size', (req, res) =>
{
  res.status(200).send({ minSize: params.init.minFileSize, maxSize: params.init.maxFileSize });
});

/****************************************************************************************************/

router.post('/update-service-max-file-size', (req, res) =>
{
  if(req.body.serviceName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'service name is missing' });

  else if(req.body.fileSize == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'max file size is missing' });

  else
  {
    storageAppServicesGet.getServiceUsingName(req.body.serviceName, req.app.get('mysqlConnector'), (error, service) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        if(req.body.fileSize < params.init.minFileSize) res.status(406).send({ message: errors[constants.MAX_FILE_SIZE_OUT_OF_RANGE], detail: 'file size is too low' });

        else if(req.body.fileSize > params.init.maxFileSize) res.status(406).send({ message: errors[constants.MAX_FILE_SIZE_OUT_OF_RANGE], detail: 'file size is too high' });

        else
        {
          storageAppAdminGet.getAccountAdminRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
          {
            if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

            else if(rights.modify_services == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_MODIFY_SERVICES], detail: null });

            else
            {
              storageAppAdminServices.updateServiceMaxFileSize(service.id, req.body.fileSize, req.app.get('mysqlConnector'), (error) =>
              {
                if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                else
                {
                  res.status(200).send({ message: success[constants.SERVICE_MAX_FILE_SIZE_SUCCESSFULLY_UPDATED] });
                }
              });
            }
          });
        }
      }
    });
  }
});

/****************************************************************************************************/

router.post('/get-service-members', (req, res) =>
{
  if(req.body.serviceName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'service name is missing from the request' });

  else
  {
    storageAppServicesGet.getServiceUsingName(req.body.serviceName, req.app.get('mysqlConnector'), (error, service) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        storageAppAdminGet.getAccountAdminRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          else if(rights.consult_services_rights == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_CONSULT_SERVICES_RIGHTS], detail: null });

          else
          {
            accessGet.getAccountsThatHaveAccessToStorageApp(req.app.get('mysqlConnector'), (error, accounts) =>
            {
              if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

              else
              {
                storageAppServicesGet.getMembersFromService(service.id, req.app.get('mysqlConnector'), (error, members) =>
                {
                  if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                  else
                  {
                    var x = 0, updatedAccounts = {};

                    var browseAccounts = () =>
                    {
                      updatedAccounts[accounts[x].id] = {};
                      updatedAccounts[accounts[x].id] = accounts[x];
                      
                      if(accounts[x += 1] != undefined) browseAccounts();

                      else
                      {
                        res.status(200).send({ accounts: updatedAccounts, members: members, rights: rights });
                      }
                    }

                    if(accounts[x] != undefined) browseAccounts();

                    else
                    {
                      res.status(200).send({ accounts: updatedAccounts, members: members, rights: rights });
                    }
                  }
                });
              }
            });
          }
        });
      }
    });
  }
});

/****************************************************************************************************/

router.get('/get-account-admin-rights', (req, res) =>
{
  storageAppAdminGet.getAccountAdminRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
  {
    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    else
    {
      res.status(200).send({ rights: rights });
    }
  });
});

/****************************************************************************************************/

module.exports = router;