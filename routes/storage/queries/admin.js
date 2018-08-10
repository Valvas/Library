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
  if(req.body.accountUuids == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Account(s) is/are missing from the request' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service is missing from the request' });

  else
  {
    const accountUuids = JSON.parse(req.body.accountUuids);
    
    storageAppAdminServices.addMembersToService(req.body.serviceUuid, accountUuids, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(201).send({ message: success[constants.ACCOUNTS_SUCCESSFULLY_ADDED_TO_SERVICE] });
      }
    });
  }
});

/****************************************************************************************************/

router.delete('/remove-access-to-a-service', (req, res) =>
{
  if(req.body.accountUuids == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Account(s) is/are missing from the request' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service is missing from the request' });

  else
  {
    const accountUuids = JSON.parse(req.body.accountUuids);

    storageAppAdminServices.removeMembersFromService(req.body.serviceUuid, accountUuids, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ message: success[constants.ACCOUNTS_SUCCESSFULLY_REMOVED_FROM_SERVICE] });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/update-rights-on-service', (req, res) =>
{
  storageAppAdminServices.updateRightsOnService(req.body.serviceUuid, req.body.accountUuid, req.session.account.id, JSON.parse(req.body.rightsObject), req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    else
    {
      res.status(200).send({ message: success[constants.ACCOUNT_RIGHTS_SUCCESSFULLY_UPDATED] });
    }
  });
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
  if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'service identifier is missing' });

  else if(req.body.fileSize == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'max file size is missing' });

  else
  {
    storageAppServicesGet.getServiceUsingUUID(req.body.serviceUuid, req.app.get('mysqlConnector'), (error, service) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        if(req.body.fileSize < params.init.minFileSize) res.status(406).send({ message: errors[constants.MAX_FILE_SIZE_OUT_OF_RANGE], detail: 'file size is too low' });

        else if(req.body.fileSize > params.init.maxFileSize) res.status(406).send({ message: errors[constants.MAX_FILE_SIZE_OUT_OF_RANGE], detail: 'file size is too high' });

        else
        {
          storageAppAdminGet.getAccountAdminRights(req.session.account.id, req.app.get('mysqlConnector'), req.app.get('params'), (error, rights) =>
          {
            if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

            else if(rights.modify_services == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_MODIFY_SERVICES], detail: null });

            else
            {
              storageAppAdminServices.updateServiceMaxFileSize(req.body.serviceUuid, req.body.fileSize, req.app.get('mysqlConnector'), req.app.get('params'), (error) =>
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

router.put('/get-service-members', (req, res) =>
{
  if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'service identifier is missing from the request' });

  else
  {
    storageAppAdminGet.getServiceMembers(req.body.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceMembers) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ serviceMembers: serviceMembers });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/get-accounts-that-can-be-added-to-service', (req, res) =>
{
  if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'service identifier is missing from the request' });

  else
  {
    storageAppAdminGet.getAccountsThatCanBeAddedToService(req.body.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ accounts: accounts });
      }
    });
  }
});

/****************************************************************************************************/

router.get('/get-account-admin-rights', (req, res) =>
{
  storageAppAdminGet.getAccountAdminRights(req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rights) =>
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