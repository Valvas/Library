'use strict';

const express = require('express');

let account = require('./functions/accounts/functions');

let app = express();

/*****************************************************************************************************************************/

module.exports = function(req, res, next)
{
  account.checkIfUserIsAdmin(req.session.identifier, req.app.get('mysqlConnector'), function(result)
  {
    result == 3 ? next() : res.redirect('/');
  });
};

/*****************************************************************************************************************************/