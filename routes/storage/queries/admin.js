'use strict'

const express                   = require('express');
const errors                    = require(`${__root}/json/errors`);
const success                   = require(`${__root}/json/success`);
const constants                 = require(`${__root}/functions/constants`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppAccessGet       = require(`${__root}/functions/storage/access/get`);
const storageAppAdminUpdate     = require(`${__root}/functions/storage/admin/update`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppAdminServices   = require(`${__root}/functions/storage/admin/services`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

var router = express.Router();

/****************************************************************************************************/
// CREATE SERVICE
/****************************************************************************************************/

router.post('/create-service', (req, res) =>
{
  if(req.app.locals.isAdmin == false) return res.status(403).send({ message: errors[constants.IS_NOT_APP_ADMIN], detail: null });

  const serviceData = JSON.parse(req.body.serviceData);

  if(serviceData.serviceName == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service name' });
  if(serviceData.maxFileSize == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Max file size' });
  if(serviceData.authorizedExtensions == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Authorized extensions' });

  storageAppAdminServices.createService(serviceData.serviceName, serviceData.maxFileSize, serviceData.authorizedExtensions, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, createdServiceUuid) =>
  {      
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in('storageAppAdminServicesList').emit('serviceCreated', { serviceUuid: createdServiceUuid, serviceName: serviceData.serviceName, fileLimit: serviceData.maxFileSize }, storageAppStrings);

    return res.status(201).send({ title: '', message: success[constants.SERVICE_SUCCESSFULLY_CREATED], detail: null });
  });
});

/****************************************************************************************************/
// UPDATE SERVICE
/****************************************************************************************************/

router.put('/update-service', (req, res) =>
{
  if(req.app.locals.isAdmin == false) return res.status(403).send({ message: errors[constants.IS_NOT_APP_ADMIN], detail: null });

  const serviceData = JSON.parse(req.body.serviceData);

  if(serviceData.serviceUuid == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service uuid' });
  if(serviceData.serviceName == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service name' });
  if(serviceData.maxFileSize == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Max file size' });
  if(serviceData.authorizedExtensions == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Authorized extensions' });

  storageAppAdminServices.updateService(serviceData.serviceUuid, serviceData.serviceName, serviceData.maxFileSize, serviceData.authorizedExtensions, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in('storageAppAdminServicesList').emit('serviceUpdated', { serviceUuid: serviceData.serviceUuid, serviceName: serviceData.serviceName, fileLimit: serviceData.maxFileSize }, storageAppStrings);
      
    return res.status(201).send({ title: '', message: success[constants.SERVICE_SUCCESSFULLY_UPDATED], detail: null });
  });
});

/****************************************************************************************************/
// REMOVE SERVICE
/****************************************************************************************************/

router.put('/remove-service', (req, res) =>
{
  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service uuid' });

  storageAppAdminServices.removeService(req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceRemoveStats) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail, serviceRemoveStats: serviceRemoveStats });
    
    req.app.get('io').in('storageAppAdminServicesList').emit('serviceRemoved', req.body.serviceUuid, storageAppStrings);

    return res.status(200).send({ message: success[constants.SERVICE_SUCCESSFULLY_REMOVED], serviceRemoveStats: serviceRemoveStats });
  });
});

/****************************************************************************************************/
// UPDATE ACCOUNT ADMIN STATUS
/****************************************************************************************************/

router.put('/update-admin-status', (req, res) =>
{
  if(req.app.locals.isAdmin == false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  storageAppAdminUpdate.updateAccountAdminStatus(req.body.accountUuid, req.body.isAdmin === 'true', req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ message: success[constants.ADMIN_ACCOUNT_STATUS_SUCCESSFULLY_UPDATED] });
  });
});

/****************************************************************************************************/
// UPDATE ACCOUNT RIGHTS LEVEL ON A SERVICE
/****************************************************************************************************/

router.put('/update-account-service-rights', (req, res) =>
{
  if(req.body.serviceUuid == undefined)         return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });
  if(req.body.accountUuid == undefined)         return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'accountUuid' });
  if(req.body.serviceRights == undefined)       return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceRights' });

  const serviceRights = JSON.parse(req.body.serviceRights);

  console.log(serviceRights);
  /*
  storageAppServicesGet.checkIfServiceExistsFromUuid(req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExists, serviceData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(serviceExists == false) return res.status(404).send({ message: errors[constants.SERVICE_NOT_FOUND], detail: null });

    storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsLevelOnService) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      if(rightsLevelOnService < req.body.selectedRightsLevel) return res.status(403).send({ message: errors[constants.SERVICE_RIGHTS_LEVEL_TOO_LOW_TO_PERFORM_THIS_REQUEST], detail: null });

      storageAppAccessGet.checkIfAccountHasAccessToTheApp(req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, hasAccess) =>
      {
        if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        if(hasAccess == false) return res.status(406).send({ message: errors[constants.ACCOUNT_TO_UPDATE_HAS_NO_ACCESS_TO_THE_APPLICATION], detail: null });

        storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountToUpdateRightsLevelOnService) =>
        {
          if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          if(accountToUpdateRightsLevelOnService >= rightsLevelOnService) return res.status(403).send({ message: errors[constants.CANNOT_MODIFY_RIGHTS_ON_SERVICE_FOR_AN_ACCOUNT_WITH_HIGHER_RIGHTS], detail: null });

          storageAppServicesRights.updateAccountRightsLevelOnService(req.body.accountUuid, req.body.serviceUuid, req.body.selectedRightsLevel, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
          {
            if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

            return res.status(200).send({ message: success[constants.ACCOUNT_RIGHTS_SUCCESSFULLY_UPDATED] });
          });
        });
      });
    });
  });*/
});

/****************************************************************************************************/

module.exports = router;