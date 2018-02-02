'use strict';

const fs                = require('fs');
const express           = require('express');
const params            = require(`${__root}/json/params`);
const initFormat        = require(`${__root}/functions/init/format`);
const initDatabase      = require(`${__root}/functions/init/database`);

const router = express.Router();

/****************************************************************************************************/

router.get('/logon', (req, res) =>
{
  if(params.ready == false)
  {
    req.session.identified == true ? res.redirect('/init/form') : res.render('init/logon');
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.post('/logon', (req, res) =>
{
  if(params.ready == false)
  {
    req.body.password == undefined ? res.status(406).send({ result: false, message: 'Mot de passe manquant dans la requête' }) :

    fs.readFile(`${__root}/password`, (err, data) => 
    {
      if(req.body.password != data) res.status(406).send({ result: false, message: 'Le mot de passe est incorrect' });

      else
      {
        req.session.identified = true;
        res.status(200).send({ result: true });
      }
    });
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/form', (req, res) =>
{
  if(params.ready == false)
  {
    req.session.identified == true ? res.render('init/form') : res.redirect('/init/logon');
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.post('/form', (req, res) =>
{
  if(params.ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') :

    initFormat.checkConfigDataFormat(req.body.dataObject, (error) =>
    {
      error == null ? res.status(200).send({ result: true }) : res.status(error.status).send({ result: false, message: error.message });
    });
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/test', (req, res) =>
{
  if(params.ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') : res.render('init/test');
  }

  else
  {
    res.redirect('/');
  }
});

/****************************************************************************************************/

router.get('/test/database', (req, res) =>
{
  if(params.ready == false)
  {
    req.session.identified != true ? res.redirect('/init/logon') :

    initDatabase.checkAccessToDatabase(params.database, (error) =>
    {
      error == null ? res.status(200).send({ result: true }) : res.status(error.status).send({ result: false, message: error.message });
    });
  }

  else
  {
    res.redirect('/');
  }
});
/****************************************************************************************************/

module.exports = router;