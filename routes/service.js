'use strict';

var express           = require('express');
var multer            = require('multer');

var services          = require('../functions/services');
var constants         = require('../functions/constants');
var filesAdding       = require('../functions/files/adding');
var filesDeleting     = require('../functions/files/deleting');
var accountRights     = require('../functions/accounts/rights');
var filesDownloading  = require('../functions/files/downloading');

var errors            = require(`${__root}/json/errors`);
var params            = require(`${__root}/json/config`);
var success           = require(`${__root}/json/success`);
var servicesList      = require(`${__root}/json/services`);

var storage = multer.diskStorage(
{
  destination: (req, file, callback) => { callback(null, `${params.path_to_root_storage}/${params.path_to_temp_storage}`); },
  filename: (req, file, callback) => { callback(null, file.originalname); }
});
 
var upload = multer({ storage: storage });

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('services', { navigationLocation: 'services', asideLocation: '', services: require('../json/services') });
});

/****************************************************************************************************/

router.put('/get-user-rights', (req, res) =>
{
  accountRights.getUserRightsTowardsService(req.body.service, req.session.uuid, req.app.get('mysqlConnector'), (rightsOrFalse, errorStatus, errorCode) =>
  {
    rightsOrFalse == false ?
    res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
    res.status(200).send({ result: true, rights: rightsOrFalse });
  });
});

/****************************************************************************************************/

router.post('/post-new-file', upload.single('file'), (req, res) =>
{
  req.file == undefined || req.body.service == undefined ? res.status(406).send({ result: false, message: `Erreur [406] - ${errors[constants.MISSING_DATA_IN_REQUEST]} !` }) :
  
  filesAdding.addOneFile(req.body.service, req.file, req.session.uuid, req.app.get('mysqlConnector'), (fileUUIDOrFalse, logIDOrErrorStatus, errorCode) =>
  {
    fileUUIDOrFalse == false ? 
    res.status(logIDOrErrorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
    res.status(200).send({ result: true, message: `${success[20007].charAt(0).toUpperCase()}${success[20007].slice(1)}`, fileUUID: fileUUIDOrFalse, log: logIDOrErrorStatus });
  });
});

/****************************************************************************************************/

router.delete('/delete-file', (req, res) =>
{
  req.body.file == undefined || req.body.service == undefined ? res.status(406).send(false) :

  filesDeleting.deleteOneFile(req.body.service, req.body.file, req.session.uuid, req.app.get('mysqlConnector'), (deleteLogIdOrErrorMessage, errorStatus, errorCode) =>
  {
    deleteLogIdOrErrorMessage == false ?
    res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
    res.status(200).send({ result: true, message: `${success[20005].charAt(0).toUpperCase()}${success[20005].slice(1)}`, log: deleteLogIdOrErrorMessage });
  });
});

/****************************************************************************************************/

router.put('/get-ext-accepted', (req, res) =>
{
  if(req.body.service == undefined) res.status(406).send(false);

  else
  {
    servicesList[req.body.service]['ext_accepted'] == undefined ? 
    res.status(404).send({ result: false }) : 
    res.status(200).send({ result: true, ext: servicesList[req.body.service]['ext_accepted'] });
  }
});

/****************************************************************************************************/

router.get('/download-file/:service/:file', (req, res) =>
{
  filesDownloading.downloadFile(req.params.service, req.params.file, req.session.uuid, req.app.get('mysqlConnector'), (fileOrFalse, errorStatusOrLogID, errorCode) =>
  {
    res.setHeader('logID', errorStatusOrLogID);

    fileOrFalse == false ? 
    
    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

    res.download(`${params.path_to_root_storage}/${req.params.service}/${fileOrFalse}`);
  });
});

/****************************************************************************************************/

router.put('/get-files-list', (req, res) =>
{
  req.body.service == undefined ? res.status(406).send({ result: false, message: `Erreur [406] - ${errors[constants.MISSING_DATA_IN_REQUEST]} !` }) :

  accountRights.getUserRightsTowardsService(req.body.service, req.session.uuid, req.app.get('mysqlConnector'), (rightsOrFalse, errorStatus, errorCode) =>
  {
    rightsOrFalse == false ? res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

    services.getFilesFromOneService(req.body.service, req.app.get('mysqlConnector'), (filesOrFalse, errorStatus, errorCode) =>
    {
      filesOrFalse == false ? 
      res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
      res.status(200).send({ result: true, files: filesOrFalse, rights: rightsOrFalse });
    });
  });
});

/****************************************************************************************************/

router.get('/get-list', (req, res) =>
{
  res.status(200).send({ result: true, services: require(`${__root}/json/services`) });
});

/****************************************************************************************************/

router.get('/:service', (req, res) =>
{
  !(req.params.service in require('../json/services')) ? res.render('404') :

  accountRights.getUserRightsTowardsService(req.params.service, req.session.uuid, req.app.get('mysqlConnector'), (rightsOrFalse, errorStatus, errorCode) =>
  {
    if(rightsOrFalse == false) res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });

    else
    {
      services.getFilesFromOneService(req.params.service, req.app.get('mysqlConnector'), (filesOrFalse, errorStatus, errorCode) =>
      {
        filesOrFalse == false ?
        res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
        res.render('service', { navigationLocation: 'services', asideLocation: req.params.service, links: require('../json/services'), service: require('../json/services')[req.params.service].name, identifier: req.params.service, rights: rightsOrFalse, files: filesOrFalse });
      }); 
    }
  });
});

/****************************************************************************************************/

module.exports = router;