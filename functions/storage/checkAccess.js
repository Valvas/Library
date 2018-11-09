'use strict'

const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const storageAppAccessGet   = require(`${__root}/functions/storage/access/get`);

/****************************************************************************************************/

module.exports = (req, res, next) =>
{
  storageAppAccessGet.checkIfAccountHasAccessToTheApp(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, hasAccess) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: '/' });

    else if(hasAccess == false) res.render('block', { message: errors[constants.UNAUTHORIZED_TO_ACCESS_THIS_APP], detail: null, link: '/' });

    else
    {
      next();
    }
  });
}

/****************************************************************************************************/