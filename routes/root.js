'use strict';

let express           = require('express');
let messages          = require('../json/messages');
let logon             = require('../functions/logon');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  res.render('index');
});

/****************************************************************************************************/

router.put('/', function(req, res)
{
  req.body.emailAddress == undefined || req.body.uncryptedPassword == undefined ? res.status(406).send('406 - MISSING DATA') :

  logon.checkIfAccountExistsUsingCredentialsProvided(req.body.emailAddress, req.body.uncryptedPassword, req.app.get('mysqlConnector'), function(result, account)
  {
    if(result == false) res.status(500).send('500 - INTERNAL SERVER ERROR');

    else
    {
      if(result == true && account == undefined) res.status(200).send({ 'result': false, 'message': messages['no_account_found'] });
      else if(result == true && account['activated'] == 0) res.status(200).send({ 'result': false, 'message': messages['account_not_activated'] });
      else if(result == true && account['suspended'] == 1) res.status(200).send({ 'result': false, 'message': messages['account_suspended'] });

      else
      {
        req.session.active = true;
        req.session.identifier = account['email'];

        res.status(200).send({ result: true });
      }
    }
  });
});

/****************************************************************************************************/

module.exports = router;