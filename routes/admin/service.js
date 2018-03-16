'use strict';

const express           = require('express');
const errors            = require(`${__root}/json/errors`);
const constants         = require(`${__root}/functions/constants`);
const servicesGet       = require(`${__root}/functions/services/get`);
const adminServices     = require(`${__root}/functions/admin/services`);

const router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('./admin/services', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'services' });
});

/****************************************************************************************************/

router.get('/get-list', (req, res) =>
{
  servicesGet.getAllServices(req.app.get('mysqlConnector'), (error, services) =>
  {
    error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

    filesGet.getFilesForEachService(req.app.get('mysqlConnector'), (error, filesCounterObject) =>
    {
      error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

      servicesGet.getMembersForEachService(req.app.get('mysqlConnector'), (error, membersCounterObject) =>
      {
        error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

        servicesGet.getPeopleWhoHaveAccessToEachService(req.app.get('mysqlConnector'), (error, accessCounterObject) =>
        {
          error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

          res.status(200).send({ result: true, filesCounter: filesCounterObject, membersCounter: membersCounterObject, accessCounter: accessCounterObject, services: services });
        });
      });
    });
  });
});

/****************************************************************************************************/

router.get('/:service', (req, res) =>
{
  servicesGet.getService(req.params.service, req.app.get('mysqlConnector'), (error, service) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail });

    else
    {
      res.render('admin/service', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'services', service: service });
    }
  });
});

/****************************************************************************************************/

router.post('/get-detail', (req, res) =>
{
  if(req.body.service == undefined) res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `ERR_MISSING_ARGS : 'service'` });

  else if(Object.keys(require(`${__root}/json/services`)).includes(req.body.service) == false) res.status(404).send({ result: false, message: errors[constants.SERVICE_NOT_FOUND], detail: `ERR_INVALID_ARG_VALUE : service = ' ${req.body.service} '` });

  else
  {
    adminServices.getMembers(req.body.service, req.app.get('mysqlConnector'), (error, members) =>
    {
      error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

      adminServices.getAccessMembers(req.body.service, req.app.get('mysqlConnector'), (error, access) =>
      {
        error != null ? 
        res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :
        res.status(200).send({ result: true, members: members, access: access });
      });
    });
  }
});

/****************************************************************************************************/

router.get('/new-service', (req, res) =>
{
  res.render('admin/services/form', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'services' });
});

/****************************************************************************************************/

module.exports = router;