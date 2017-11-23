'use strict';

let express = require('express');
let multer  = require('multer');

let services          = require('../functions/services');
let account           = require('../functions/accounts/functions');
let files             = require('../functions/files');
let config            = require('../json/config');

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

  files.deleteFile(req.body.file, req.body.service, req.session.identifier, req.app.get('mysqlConnector'), function(result)
  {
    res.status(200).send(result);
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
  req.file == undefined || req.body.service == undefined ? res.status(406).send('ERROR : No file provided !') :
  
  account.getUserRightsTowardsService(req.body.service, req.session.identifier, req.app.get('mysqlConnector'), function(rights)
  {
    rights == false ? res.status(500).send('ERROR : Internal server error !') :

    rights['upload_files'] == 0 ? res.status(403).send('ERROR : cette action requiert des droits !') : 
    
    files.uploadFile(req.file, req.body.service, req.session.identifier, req.app.get('mysqlConnector'), function(result, code)
    {
      if(result == false)
      {
        if(code == 0){ res.status(500).send(false); }
        if(code == 1){ res.status(200).send(false); }
      }

      else{ res.status(200).send(true); }
    });
  });
});

/****************************************************************************************************/

router.get('/download-file/:service/:file', function(req, res)
{
  req.params.file == undefined || req.params.service == undefined ? res.status(406).send('ERROR [406] - MISSING DATA !') :

  files.downloadFile(req.params.file, req.params.service, req.session.identifier, req.app.get('mysqlConnector'), function(result, code)
  {
    if(result == false)
    {
      if(code == 0){ res.status(500).send('ERROR [500] - INTERNAL SERVER ERROR !'); }
      if(code == 1){ res.status(404).send('ERROR [404] - FILE NOT FOUND !'); }
      if(code == 2){ res.status(500).send('ERROR [401] - NOT AUTHORIZED !'); }
    }

    else
    {
      res.download(`${config['path_to_root_storage']}/${req.params.service}/${result}`);
    }
  });
});

/****************************************************************************************************/

module.exports = router;