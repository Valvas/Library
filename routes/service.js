'use strict';

let express = require('express');
let multer  = require('multer');

let config            = require('../json/config');
let errors            = require('../json/errors');
let success           = require('../json/success');
let services          = require('../functions/services');
let constants         = require('../functions/constants');
let filesRemoval      = require('../functions/files/delete');
let account           = require('../functions/accounts/functions');

let accountRights     = require('../functions/accounts/rights');

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

  accountRights.getUserRightsTowardsService(req.params.service, req.session.uuid, req.app.get('mysqlConnector'), function(success, rights)
  {
    if(success == false)
    {
      switch(rights)
      {
        case 0: res.render('block', { message: `Erreur interne du serveur, veuillez réessayer` });
        case 1: res.render('block', { message: `La requête ne peut pas être traitée car des données sont manquantes` });
        case 2: res.render('block', { message: `Compte introuvable, veuillez signaler cette erreur` });
        case 3: res.render('block', { message: `Le service demandé n'existe pas ou n'existe plus` });
        case 4: res.render('block', { message: `Vous n'êtes pas autorisé(e) à accéder à cette page` });
      }
    }

    else
    {
      services.getFilesFromOneService(req.params.service, req.app.get('mysqlConnector'), function(files)
      {
        files == false ?
        res.render('block', { message: `Erreur interne du serveur, veuillez réessayer` }) :
        res.render('service', { location: req.params.service, links: require('../json/services'), service: require('../json/services')[req.params.service].name, identifier: req.params.service, rights: rights, files: files });
      }); 
    }
  });
});

/****************************************************************************************************/

router.delete('/delete-file', function(req, res)
{
  req.body.file == undefined || req.body.service == undefined ? res.status(406).send(false) :

  filesRemoval.deleteOneFile(req.body.service, req.body.file, req.session.uuid, req.app.get('mysqlConnector'), function(returnObject)
  {
    if(returnObject['findFileInTheDatabaseUsingItsUUID']['result'] == false)
    {
      res.status(500).send({ result: false, message: `ERROR [500] - ${errors[returnObject['findFileInTheDatabaseUsingItsUUID']['code']]} !` });
    }

    else if(returnObject['checkIfUserHasTheRightToDeleteFiles']['result'] == false)
    {
      res.status(403).send({ result: false, message: `ERROR [403] - ${errors[returnObject['checkIfUserHasTheRightToDeleteFiles']['code']]} !` });
    }

    else
    {
      if(returnObject['deleteFileFromHardware']['result'] == true && returnObject['deleteFileFromDatabase']['result'] == true)
      {
        res.status(200).send({ result: true, success: success[FILE_DELETED].charAt(0).toUpperCase() + success[FILE_DELETED].slice(1) })
      }

      else
      {
        let errorMessages = [];
        
        if(returnObject['deleteFileFromHardware']['result'] == false)
        {
          errorMessages.push(`${errors[returnObject['deleteFileFromHardware']['code']].charAt(0).toUpperCase() + errors[returnObject['deleteFileFromHardware']['code']].slice(1)} !`);
        }
        
        if(returnObject['deleteFileFromDatabase']['result'] == false)
        {
          errorMessages.push(`${errors[returnObject['deleteFileFromDatabase']['code']].charAt(0).toUpperCase() + errors[returnObject['deleteFileFromDatabase']['code']].slice(1)} !`);
        }

        if()
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

router.post('/post-new-file', upload.single('file'), function(req, res)
{
  
});

/****************************************************************************************************/

router.get('/download-file/:service/:file', function(req, res)
{
  
});

/****************************************************************************************************/

module.exports = router;