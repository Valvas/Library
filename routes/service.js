'use strict';

let express = require('express');

let services          = require('../functions/services');
let account           = require('../functions/accounts/functions');
let files             = require('../functions/files');
let config            = require('../json/config');

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

module.exports = router;