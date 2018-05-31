'use strict'

const express             = require('express');

const errors              = require(`${__root}/json/errors`);
const adminAppRightsGet   = require(`${__root}/functions/admin/rights/get`);

var app = express();

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  adminAppRightsGet.getAccountRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], link: '/home' });

    else
    {
      req.app.locals.rights = rights;
      next();
    }
  });
};

/*****************************************************************************************************************************/