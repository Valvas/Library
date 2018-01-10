'use strict';

var express = require('express');

var errors            = require(`${__root}/json/errors`);
var accountRights     = require(`${__root}/functions/accounts/rights`);

var app = express();

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  accountRights.checkIfUserIsAdmin(req.session.uuid, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
  {
    boolean ? next() : res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
  });
};

/*****************************************************************************************************************************/