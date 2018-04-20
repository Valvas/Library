'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const adminAppStrings       = require(`${__root}/json/strings/admin`);
const commonAppStrings      = require(`${__root}/json/strings/common`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const adminAppRightsGet     = require(`${__root}/functions/admin/rights/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  accountsGet.getAllAccounts(req.app.get('mysqlConnector'), (error, accounts) =>
  {
    if(error != null)
    {
      res.render('admin/rights/home',
      { 
        account: req.session.account,
        error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
        strings: { common: commonAppStrings, admin: adminAppStrings },
        accounts: null
      });
    }

    else
    {
      res.render('admin/rights/home',
      { 
        account: req.session.account,
        error: null,
        strings: { common: commonAppStrings, admin: adminAppStrings },
        accounts: accounts
      });
    }
  });
});

/****************************************************************************************************/

router.get('/:account', (req, res) =>
{
  accountsGet.getAccountUsingUUID(req.params.account, req.app.get('mysqlConnector'), (error, account) =>
  {
    if(error != null)
    {
      res.render('admin/rights/detail',
      { 
        account: req.session.account,
        error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
        strings: { common: commonAppStrings, admin: adminAppStrings },
        detailedAccount: null,
        currentAccountRights: null,
        detailedAccountRights: null
      });
    }

    else
    {
      adminAppRightsGet.getAccountRights(account.id, req.app.get('mysqlConnector'), (error, rights) =>
      {
        if(error != null)
        {
          res.render('admin/rights/detail',
          { 
            account: req.session.account,
            error: { message: errors[error.code], detail: error.status == 404 ? `Cet utilisateur n'a pas accès à cette application, avant de pouvoir gérer ses droits il faut d'abord lui donner un accès` : error.detail },
            strings: { common: commonAppStrings, admin: adminAppStrings },
            detailedAccount: null,
            currentAccountRights: null,
            detailedAccountRights: null
          });
        }

        else
        {
          if(req.app.locals.rights.consult_rights == 0)
          {
            res.render('admin/rights/detail',
            {
              account: req.session.account,
              error: { message: errors[constants.UNAUTHORIZED_TO_CONSULT_ACCOUNT_RIGHTS], detail: null },
              strings: { common: commonAppStrings, admin: adminAppStrings },
              detailedAccount: null,
              currentAccountRights: null,
              detailedAccountRights: null
            });
          }

          else
          {
            res.render('admin/rights/detail',
            {
              account: req.session.account,
              error: null,
              strings: { common: commonAppStrings, admin: adminAppStrings },
              detailedAccount: account,
              currentAccountRights: req.app.locals.rights,
              detailedAccountRights: rights
            });
          }
        }
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;