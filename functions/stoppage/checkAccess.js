'use strict'

const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const stoppageAppGetAccess  = require(`${__root}/functions/stoppage/getAccess`);

/****************************************************************************************************/

module.exports = (req, res, next) =>
{
  stoppageAppGetAccess.checkIfAccountHasAccessToTheApp(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, hasAccess) =>
  {
    if(error !== null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/' });

    if(hasAccess === false) return res.render('block', { message: errors[constants.UNAUTHORIZED_TO_ACCESS_THIS_APP], detail: null, link: '/' });

    next();
  });
}

/****************************************************************************************************/
