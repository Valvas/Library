'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const adminAppStrings       = require(`${__root}/json/strings/admin`);
const commonAppStrings      = require(`${__root}/json/strings/common`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  accountsGet.getAllAccounts(req.app.get('mysqlConnector'), (error, accounts) =>
  {
    if(error != null)
    {
      res.render('admin/access/home',
      { 
        account: req.session.account,
        error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
        strings: { common: commonAppStrings, admin: adminAppStrings },
        accounts: null
      });
    }

    else
    {
      res.render('admin/access/home',
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
    {res.render('block', { message: errors[error.code], link: '/' });
      /*res.render('admin/access/detail',
      { 
        account: req.session.account,
        error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
        strings: { common: commonAppStrings, admin: adminAppStrings },
        detailedAccount: null,
        currentAccountRights: null,
        detailedAccountAccess: null
      });*/
    }

    else
    {
      commonAppsAccess.getAppsAvailableForAccount(account.id, req.app.get('mysqlConnector'), (error, access) =>
      {
        if(error != null)
        {res.render('block', { message: errors[error.code], link: '/' });
          /*res.render('admin/access/detail',
          {
            account: req.session.account,
            error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
            strings: { common: commonAppStrings, admin: adminAppStrings },
            detailedAccount: null,
            currentAccountRights: null,
            detailedAccountAccess: null
          });*/
        }

        else
        {
          if(req.app.locals.rights.consult_access == 0)
          {res.render('block', { message: 'unauthorized to consult', link: '/' });
            /*res.render('admin/access/detail',
            { 
              account: req.session.account,
              error: { message: errors[constants.UNAUTHORIZED_TO_CONSULT_ACCOUNT_ACCESS], detail: null },
              strings: { common: commonAppStrings, admin: adminAppStrings },
              detailedAccount: null,
              currentAccountRights: null,
              detailedAccountAccess: null
            });*/
          }

          else
          {
            delete access.id;
            delete access.account;
            res.render('block', { message: 'success', link: '/' });

            /*res.render('admin/access/detail',
            { 
              account: req.session.account,
              error: null,
              strings: { common: commonAppStrings, admin: adminAppStrings },
              detailedAccount: account,
              currentAccountRights: req.app.locals.rights,
              detailedAccountAccess: access
            });*/
          }
        }
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;