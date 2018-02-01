'use strict';

const fs                = require('fs');
const express           = require('express');

const router = express.Router();

/****************************************************************************************************/

router.get('/logon', (req, res) =>
{
  req.session.identified == true ? res.redirect('/init/form') : res.render('init/logon');
});

/****************************************************************************************************/

router.post('/logon', (req, res) =>
{
  if(req.body.password == undefined) res.status(406).send({ result: false, message: 'Mot de passe manquant dans la requête' });

  else
  {
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
});

/****************************************************************************************************/

router.get('/form', (req, res) =>
{
  req.session.identified == true ? res.render('init/form') : res.redirect('/init/logon');
});

/****************************************************************************************************/

router.post('/form', (req, res) =>
{
  if(req.session.identified != true) res.redirect('/init/logon');

  else
  {
    //CHECK FORM AND LAUNCH SECOND SERVER PART
  }
});

/****************************************************************************************************/

module.exports = router;