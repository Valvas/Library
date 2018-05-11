'use strict'

const express             = require('express');

const errors              = require(`${__root}/json/errors`);
const storageAdminGet     = require(`${__root}/functions/storage/admin/get`);

var app = express();

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  storageAdminGet.getAccountAdminRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], link: req.header('Referer') == undefined ? '/' : req.header('Referer') });

    else
    {
      req.app.locals.rights = rights;
      next();
    }
  });
};

/*****************************************************************************************************************************/