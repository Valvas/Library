'use strict'

const express                   = require('express');
const formidable                = require('formidable');
const params                    = require(`${__root}/json/params`);
const errors                    = require(`${__root}/json/errors`);
const success                   = require(`${__root}/json/success`);
const adminAppStrings           = require(`${__root}/json/strings/admin`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const constants                 = require(`${__root}/functions/constants`);
const accountsGet               = require(`${__root}/functions/accounts/get`);
const accountsCreate            = require(`${__root}/functions/accounts/create`);
const accountsUpdate            = require(`${__root}/functions/accounts/update`);
const accountsRemove            = require(`${__root}/functions/accounts/remove`);
const adminAppRightsGet         = require(`${__root}/functions/admin/rights/get`);

var router = express.Router();

/****************************************************************************************************/

router.post('/create', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      adminAppRightsGet.getAccountRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
      {
        if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], target: null });

        else
        {
          rights.create_accounts == 0 ? res.status(403).send({ result: false, message: errors[constants.UNAUTHORIZED_TO_CREATE_ACCOUNTS], target: null }) :

          accountsCreate.createAccount({ email: fields.email, lastname: fields.lastname, firstname: fields.firstname }, req.app.get('mysqlConnector'), (error, successCode) =>
          {
            if(error != null)
            {
              res.status(error.status).send({ result: false, message: errors[error.code], target: error.target == undefined ? null : error.target });
            }

            else
            {
              res.status(201).send({ result: true, message: success[successCode] });
            }
          });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/modify', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      adminAppRightsGet.getAccountRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
      {
        if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

        else
        {
          if(rights.modify_accounts == 0) res.status(403).send({ result: false, message: errors[constants.UNAUTHORIZED_TO_MODIFY_ACCOUNTS] });

          else
          {
            accountsGet.getAccountUsingUUID(fields.uuid, req.app.get('mysqlConnector'), (error, account) =>
            {
              if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

              else
              {
                var status = null;
                if(fields.suspended != undefined) status = fields.suspended == 'true' ? true : false;

                else
                {
                  status = account.suspended == 1 ? true : false;
                }

                accountsUpdate.updateAccount(
                {
                  id: account.id,
                  uuid: account.uuid,
                  email: fields.email == undefined ? account.email : fields.email,
                  lastname: fields.lastname == undefined ? account.lastname : fields.lastname.toUpperCase(),
                  firstname: fields.firstname == undefined ? account.firstname : `${fields.firstname.charAt(0).toUpperCase()}${fields.firstname.slice(1).toLowerCase()}`,
                  password: account.password,
                  suspended: status

                }, req.app.get('mysqlConnector'), (error) =>
                {
                  if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

                  else
                  {
                    res.status(200).send({ result: true, message: success[constants.ACCOUNT_UPDATED_SUCCESSFULLY] });
                  }
                });
              }
            });
          }
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/remove', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      adminAppRightsGet.getAccountRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
      {
        if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

        else
        {
          if(rights.remove_accounts == 0) res.status(403).send({ result: false, message: errors[constants.UNAUTHORIZED_TO_REMOVE_ACCOUNTS] });

          else
          {
            accountsGet.getAccountUsingUUID(fields.uuid, req.app.get('mysqlConnector'), (error, account) =>
            {
              error != null ?

              res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail }) :

              accountsRemove.removeAccount(account.id, req.app.get('mysqlConnector'), (error) =>
              {
                error != null ?

                res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail }) :

                res.status(200).send({ result: true, strings: { admin: adminAppStrings } });
              });
            });
          }
        }
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;