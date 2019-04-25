'use strict'

const express                     = require('express');
const errors                      = require(`${__root}/json/errors`);
const success                     = require(`${__root}/json/success`);
const constants                   = require(`${__root}/functions/constants`);
const commonUnitsGet              = require(`${__root}/functions/common/units/get`);
const commonUnitsAdd              = require(`${__root}/functions/common/units/add`);
const commonUnitsCreate           = require(`${__root}/functions/common/units/create`);
const commonUnitsUpdate           = require(`${__root}/functions/common/units/update`);

var router = express.Router();

/****************************************************************************************************/

router.post('/create-unit', (req, res) =>
{
  if(req.body.unitName === undefined)    return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'unitName' });
  if(req.body.unitParent === undefined)  return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'unitParent' });

  if(req.app.locals.account.isAdmin === false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  commonUnitsCreate.createUnit(req.body.unitName, req.body.unitParent, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    res.status(200).send({ message: success[constants.UNIT_SUCCESSFULLY_CREATED] });
  });
});

/****************************************************************************************************/

router.put('/update-unit-parent', (req, res) =>
{
  if(req.body.unitId == undefined)      return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'unitId' });
  if(req.body.newParentId == undefined) return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'newParentId' });

  if(req.app.locals.account.isAdmin == false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  commonUnitsUpdate.updateUnitParent(req.body.unitId, req.body.newParentId, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    commonUnitsGet.getUnits(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, units) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      res.status(200).send({ message: success[constants.UNIT_PARENT_SUCCESSFULLY_UPDATED], units: units });
    });
  });
});

/****************************************************************************************************/

router.put('/update-account-unit', (req, res) =>
{
  if(req.body.newUnitId == undefined)   return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'newUnitId' });
  if(req.body.accountUuid == undefined) return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'accountUuid' });

  if(req.app.locals.account.isAdmin == false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  commonUnitsAdd.addMemberInUnit(req.body.newUnitId, req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ message: success[constants.UNIT_MEMBER_SUCCESSFULLY_ADDED] });
  });
});

/****************************************************************************************************/

router.post('/rename-unit', (req, res) =>
{
  if(req.app.locals.account.isAdmin === false)
  {
    return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });
  }

  if(req.body.newName === undefined)
  {
    return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'newName' });
  }

  if(req.body.unitId === undefined)
  {
    return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'unitId' });
  }

  commonUnitsUpdate.updateUnitRename(req.body.unitId, req.body.newName, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send({ message: success[constants.UNIT_NAME_UPDATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

module.exports = router;
