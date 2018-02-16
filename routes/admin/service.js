'use strict';

const express           = require('express');
const errors            = require(`${__root}/json/errors`);
const constants         = require(`${__root}/functions/constants`);
const filesGet          = require(`${__root}/functions/files/get`);
const servicesGet       = require(`${__root}/functions/services/get`);

const router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('./admin/services', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'services' });
});

/****************************************************************************************************/

router.get('/get-list', (req, res) =>
{
  filesGet.getFilesForEachService(req.app.get('mysqlConnector'), (error, filesCounterObject) =>
  {
    error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

    servicesGet.getMembersForEachService(req.app.get('mysqlConnector'), (error, membersCounterObject) =>
    {
      error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

      servicesGet.getPeopleWhoHaveAccessToEachService(req.app.get('mysqlConnector'), (error, accessCounterObject) =>
      {
        error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail }) :

        res.status(200).send({ result: true, filesCounter: filesCounterObject, membersCounter: membersCounterObject, accessCounter: accessCounterObject, services: require(`${__root}/json/services`) });
      });
    });
  });
});

/****************************************************************************************************/

router.get('/:service', (req, res) =>
{
  if(Object.keys(require(`${__root}/json/services`)).includes(req.params.service) == false) res.redirect('block', { message: errors[constants.SERVICE_NOT_FOUND] });

  else
  {
    res.render('admin/service', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'services', service: req.params.service });
  }
});

/****************************************************************************************************/

router.post('/get-detail', (req, res) =>
{
  if(req.body.service == undefined) res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `ERR_MISSING_ARGS : 'service'` });

  else if(Object.keys(require(`${__root}/json/services`)).includes(req.body.service) == false) res.status(404).send({ result: false, message: errors[constants.SERVICE_NOT_FOUND], detail: `ERR_INVALID_ARG_VALUE : service = ' ${req.body.service} '` });

  else
  {

  }
});

/****************************************************************************************************/

module.exports = router;