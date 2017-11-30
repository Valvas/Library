'use strict';

let express           = require('express');
let errors            = require('../json/errors');
let success           = require('../json/success');
let messages          = require('../json/messages');
let logon             = require('../functions/logon');
let constants         = require('../functions/constants');

let router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.uuid == undefined ? res.render('index') : res.redirect('/home');
});

/****************************************************************************************************/

router.put('/', (req, res) =>
{
  req.body.emailAddress == undefined || req.body.uncryptedPassword == undefined ? res.status(406).send('406 - MISSING DATA') :

  logon.checkIfAccountExistsUsingCredentialsProvided(req.body.emailAddress, req.body.uncryptedPassword, req.app.get('mysqlConnector'), (result, account) =>
  {
    if(result == false) res.status(500).send('500 - INTERNAL SERVER ERROR');

    else
    {
      if(result == true && account == undefined) res.status(200).send({ 'result': false, 'message': messages['no_account_found'] });
      else if(result == true && account['activated'] == 0) res.status(200).send({ 'result': false, 'message': messages['account_not_activated'] });
      else if(result == true && account['suspended'] == 1) res.status(200).send({ 'result': false, 'message': messages['account_suspended'] });

      else
      {
        req.session.uuid = account['uuid'];

        res.status(200).send({ result: true });
      }
    }
  });
});

/****************************************************************************************************/

router.get('/logout', (req, res) =>
{
  req.session.destroy();

  res.redirect('/');
});

/****************************************************************************************************/

router.get('/afk-time', (req, res) =>
{
  req.session.uuid == undefined ? res.status(401).send('ERROR [401] - AUTHENTICATION REQUIRED !') : res.status(200).send({ time: require('../json/config.json')['inactivity-timeout'] });
});

/****************************************************************************************************/

module.exports = router;