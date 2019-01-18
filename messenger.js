'use strict'

const commonMessengerGet = require(`${__root}/functions/common/messenger/get`);

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  commonMessengerGet.getConversations(req.app.locals.account, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, conversations) =>
  {
    req.app.locals.conversationsData = error != null ? null : conversations;

    next();
  });
};

/*****************************************************************************************************************************/