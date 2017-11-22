'use strict';

let express = require('express');

let account = require('../functions/accounts/functions');

let router = express.Router();

/****************************************************************************************************/

router.get('/session-identifier', function(req, res)
{
  req.session.identifier == undefined ? res.status(401).send('ERROR [401] - NO ACTIVE SESSION !') : res.status(200).send({ identifier: req.session.identifier });
});

/****************************************************************************************************/

router.put('/is-admin', function(req, res)
{
  if(req.body.identifier == undefined){ res.status(406).send('ERROR [406] - NO IDENTIFIER PROVIDED !'); }
  
  else
  {
      account.checkIfUserIsAdmin(req.body.identifier, req.app.get('mysqlConnector'), function(result)
      {
        switch(result)
        {
          case 0: res.status(500).send('ERROR [500] - INTERNAL SERVER ERROR !');
          case 1: res.status(406).send('ERROR [406] - ACCOUNT NOT FOUND !');
          case 2: res.status(200).send({ admin: false });
          case 3: res.status(200).send({ admin: true });
        }
      });
  }
});

/****************************************************************************************************/

module.exports = router;