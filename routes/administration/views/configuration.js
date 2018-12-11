'use strict'

const express                     = require('express');
const errors                      = require(`${__root}/json/errors`);
const constants                   = require(`${__root}/functions/constants`);
const administrationAppStrings    = require(`${__root}/json/strings/administration`);

var router = express.Router();

/****************************************************************************************************/

router.get('/general', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  res.render('administration/configuration/general',
  {
    account: req.app.locals.account,
    currentLocation: 'config',
    currentConfigTab: 'general',
    strings: { administrationStrings: administrationAppStrings },
    globalConfiguration: req.app.get('params')
  });
});

/****************************************************************************************************/

router.get('/database', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  res.render('administration/configuration/database',
  {
    account: req.app.locals.account,
    currentLocation: 'config',
    currentConfigTab: 'database',
    strings: { administrationStrings: administrationAppStrings },
    databaseConfiguration: req.app.get('params').database
  });
});

/****************************************************************************************************/

router.get('/storage', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  res.render('administration/configuration/storage',
  {
    account: req.app.locals.account,
    currentLocation: 'config',
    currentConfigTab: 'storage',
    strings: { administrationStrings: administrationAppStrings },
    storageConfiguration: req.app.get('params').storage
  });
});

/****************************************************************************************************/

router.get('/transporter', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  res.render('administration/configuration/transporter',
  {
    account: req.app.locals.account,
    currentLocation: 'config',
    currentConfigTab: 'transporter',
    strings: { administrationStrings: administrationAppStrings },
    transporterConfiguration: req.app.get('params').transporter
  });
});

/****************************************************************************************************/

module.exports = router;