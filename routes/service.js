'use strict';

let express = require('express');
let multer  = require('multer');

let config            = require('../json/config');
let errors            = require('../json/errors');
let success           = require('../json/success');
let services          = require('../functions/services');
let constants         = require('../functions/constants');
let filesAdding       = require('../functions/files/adding');
let filesDeleting     = require('../functions/files/deleting');
let accountRights     = require('../functions/accounts/rights');
let filesDownloading  = require('../functions/files/downloading');

let storage = multer.diskStorage(
{
  destination: function (req, file, callback){ callback(null, config['path_to_temp_storage']); },
  filename: function (req, file, callback){ callback(null, file.originalname); }
});
 
let upload = multer({ storage: storage });

let router = express.Router();

/****************************************************************************************************/

router.get('/:service', function(req, res)
{
  !(req.params.service in require('../json/services')) ? res.render('404') :

  accountRights.getUserRightsTowardsService(req.params.service, req.session.uuid, req.app.get('mysqlConnector'), function(trueOrFalse, rightsOrErrorCode)
  {
    if(trueOrFalse == false) res.render('block', { message: `${errors[rightsOrErrorCode].charAt(0).toUpperCase()}${errors[rightsOrErrorCode].slice(1)}` });

    else
    {
      services.getFilesFromOneService(req.params.service, req.app.get('mysqlConnector'), function(trueOrFalse, filesObjectOrErrorCode)
      {
        trueOrFalse == false ?
        res.render('block', { message: `Erreur [500] - ${errors[filesObjectOrErrorCode].charAt(0).toUpperCase()}${errors[filesObjectOrErrorCode].slice(1)} !` }) :
        res.render('service', { location: req.params.service, links: require('../json/services'), service: require('../json/services')[req.params.service].name, identifier: req.params.service, rights: rightsOrErrorCode, files: filesObjectOrErrorCode });
      }); 
    }
  });
});

/****************************************************************************************************/

router.post('/post-new-file', upload.single('file'), function(req, res)
{
  req.file == undefined || req.body.service == undefined ? res.status(406).send(`ERROR [406] : ${errors[constants.NO_FILE_PROVIDED_IN_REQUEST].charAt(0).toUpperCase()}${errors[constants.NO_FILE_PROVIDED_IN_REQUEST].slice(1)} !`) :
  
  filesAdding.addOneFile(req.body.service, req.file, req.session.uuid, req.app.get('mysqlConnector'), function(trueOrFalse, entryUuidOrErrorCode)
  {
    trueOrFalse ? 
    res.status(200).send({ result: true, success: entryUuidOrErrorCode }) :
    res.status(200).send({ result: false, error: errors[entryUuidOrErrorCode] });
  });
});

/****************************************************************************************************/

router.delete('/delete-file', function(req, res)
{
  req.body.file == undefined || req.body.service == undefined ? res.status(406).send(false) :

  filesDeleting.deleteOneFile(req.body.service, req.body.file, req.session.uuid, req.app.get('mysqlConnector'), function(returnObject)
  {
    if(returnObject['findFileInTheDatabaseUsingItsUUID']['result'] == false)
    {
      res.status(500).send({ result: false, error: `ERROR [500] - ${errors[returnObject['findFileInTheDatabaseUsingItsUUID']['code']]} !` });
    }

    else if(returnObject['checkIfUserHasTheRightToDeleteFiles']['result'] == false)
    {
      res.status(403).send({ result: false, error: `ERROR [403] - ${errors[returnObject['checkIfUserHasTheRightToDeleteFiles']['code']]} !` });
    }

    else
    {
      if(returnObject['deleteFileFromHardware']['result'] == true && returnObject['deleteFileFromDatabase']['result'] == true)
      {
        res.status(200).send({ result: true, success: success[constants.FILE_DELETED].charAt(0).toUpperCase() + success[constants.FILE_DELETED].slice(1) })
      }

      else
      {
        let errorMessages = [];
        let successMessages = [];
        
        if(returnObject['deleteFileFromHardware']['result'] == false)
        {
          errorMessages.push(`${errors[returnObject['deleteFileFromHardware']['code']].charAt(0).toUpperCase() + errors[returnObject['deleteFileFromHardware']['code']].slice(1)} !`);
        }
        
        if(returnObject['deleteFileFromDatabase']['result'] == false)
        {
          errorMessages.push(`${errors[returnObject['deleteFileFromDatabase']['code']].charAt(0).toUpperCase() + errors[returnObject['deleteFileFromDatabase']['code']].slice(1)} !`);
        }

        if(returnObject['deleteFileFromHardware']['result'] == true)
        {
          successMessages.push(`${success[returnObject['deleteFileFromHardware']['code']].charAt(0).toUpperCase() + success[returnObject['deleteFileFromHardware']['code']].slice(1)} !`);
        }

        if(returnObject['deleteFileFromDatabase']['result'] == true)
        {
          successMessages.push(`${success[returnObject['deleteFileFromDatabase']['code']].charAt(0).toUpperCase() + success[returnObject['deleteFileFromDatabase']['code']].slice(1)} !`);
        }

        errorMessages.length == 2 ?
        res.status(200).send({ result: false, error: errorMessages.join('\n') }) :
        res.status(200).send({ result: false, success: successMessages.join('\n'), error: errorMessages.join('\n') });
      }
    }
  });
});

/****************************************************************************************************/

router.put('/get-ext-accepted', function(req, res)
{
  if(req.body.service == undefined) res.status(406).send(false);

  else
  {
    config['ext_accepted'][req.body.service] == undefined ? res.status(200).send({}) : res.status(200).send(config['ext_accepted'][req.body.service]);
  }
});

/****************************************************************************************************/

router.get('/download-file/:service/:file', function(req, res)
{
  filesDownloading.downloadFile(req.params.service, req.params.file, req.session.uuid, req.app.get('mysqlConnector'), function(trueOrFalse, fileNameOrErrorCode)
  {
    trueOrFalse == false ? res.render('block', { message: errors[fileNameOrErrorCode] }) :

    res.download(`${config.path_to_root_storage}/${req.params.service}/${fileNameOrErrorCode}`);
  });
});

/****************************************************************************************************/

router.put('/get-files-list', function(req, res)
{
  req.body.service == undefined ? res.status(406).send({ result: false, error: `Erreur [406] - ${errors[constants[MISSING_DATA_IN_REQUEST]]} !` }) :

  services.getFilesFromOneService(req.body.service, req.app.get('mysqlConnector'), function(trueOrFalse, filesObjectOrErrorCode)
  {
    if(trueOrFalse == false) res.status(200).send({ result: false, error: errors[constants[filesObjectOrErrorCode]] });

    else
    {
      accountRights.getUserRightsTowardsService(req.body.service, req.session.uuid, req.app.get('mysqlConnector'), function(trueOrFalse, rightsObjectOrErrorCode)
      {
        trueOrFalse ? 
        res.status(200).send({ result: true, files: filesObjectOrErrorCode, rights: rightsObjectOrErrorCode }) : 
        res.status(200).send({ result: false, error: errors[constants[rightsObjectOrErrorCode]] });
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;