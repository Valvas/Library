'use strict'

const errors            = require(`${__root}/json/errors`);
const storageAdminGet   = require(`${__root}/functions/storage/admin/get`);

/****************************************************************************************************/

module.exports = (req, res, next) =>
{
  storageAdminGet.checkIfAccountIsAdmin(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, isAdmin) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    req.app.locals.isAdmin = isAdmin;

    next();
  });
}

/****************************************************************************************************/