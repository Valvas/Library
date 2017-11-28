'use strict';

const express = require('express');

let errors            = require('./json/errors');
let accountRights     = require('./functions/accounts/rights');

let app = express();

/*****************************************************************************************************************************/

module.exports = function(req, res, next)
{
  accountRights.checkIfUserIsAdmin(req.session.uuid, req.app.get('mysqlConnector'), function(trueOrFalse, errorCode)
  {
    trueOrFalse ? next() : res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
  });
};

/*****************************************************************************************************************************/