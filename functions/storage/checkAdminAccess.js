'use strict'

const errors            = require(`${__root}/json/errors`);
const constants         = require(`${__root}/functions/constants`);
const storageAdminGet   = require(`${__root}/functions/storage/admin/get`);

/****************************************************************************************************/

module.exports = (req, res, next) =>
{
  storageAdminGet.getAdminRightsForAllLevels(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsData) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else
    {
      storageAdminGet.getAccountAdminLevel(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountAdminLevel) =>
      {
        if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        else
        {
          req.app.locals.storageAdminAccountLevel = accountAdminLevel;
          req.app.locals.storageAdminRights = rightsData;
          
          next();
        }
      });
    }
  });
}

/****************************************************************************************************/