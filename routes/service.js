'use strict';

let express = require('express');
let multer  = require('multer');

let services          = require('../functions/services');
let account           = require('../functions/accounts/functions');
let files             = require('../functions/files');
let config            = require('../json/config');

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

  req.app.get('mysqlConnector').query(`SELECT * FROM ${require('../json/config')['database']['library_database']}.${require('../json/config')['database']['rights_table']} WHERE service = "${req.params.service}" AND account = "${req.session.identifier}"`, function(err, rights)
  {
    if(err) res.status(500).send('500 - INTERNAL SERVER ERROR');

    else{ rights.length == 0 ? res.render('block') : res.render('service', { service: require('../json/services')[req.params.service]['name'], identifier: req.params.service }); }
  });
});

/****************************************************************************************************/

router.put('/get-user-rights', function(req, res)
{
  req.body.service == undefined ? res.status(406).send(false) :

  account.getUserRightsTowardsService(req.body.service, req.session.identifier, req.app.get('mysqlConnector'), function(rights)
  {
    if(rights == false) res.status(500).send('500 - INTERNAL SERVER ERROR');

    else{ rights == undefined ? res.status(401).send(false) : res.status(200).send(rights); }
  });
});

/****************************************************************************************************/

router.put('/get-files-list', function(req, res)
{
  req.body.service == undefined ? res.status(406).send(false) :

  services.getFilesFromOneService(req.body.service, req.app.get('mysqlConnector'), function(files)
  {
    files == false ? res.status(500).send('500 - INTERNAL SERVER ERROR') : 

    account.getUserRightsTowardsService(req.body.service, req.session.identifier, req.app.get('mysqlConnector'), function(rights)
    {
      if(rights == false) res.status(500).send('500 - INTERNAL SERVER ERROR');

      else
      {
        rights == undefined ? res.status(401).send(false) : res.status(200).send({files, rights});
      }
    });
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

module.exports = router;