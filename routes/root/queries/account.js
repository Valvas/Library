'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonRightsGet       = require(`${__root}/functions/common/rights/get`);
const commonAccountsUpdate  = require(`${__root}/functions/common/accounts/update`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-account-data', (req, res) =>
{
  res.status(200).send(req.app.locals.account);
});

/****************************************************************************************************/

router.get('/get-account-rights-on-intranet', (req, res) =>
{
  commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(rightsExist == false) return res.status(404).send({ message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null });

    const rightsEdited =
    {
      createArticles: rightsData.create_articles === 1,
      updateArticles: rightsData.update_articles === 1,
      removeArticles: rightsData.remove_articles === 1,
      updateOwnArticles: rightsData.update_own_articles === 1,
      removeOwnArticles: rightsData.remove_own_articles === 1,
      updateArticleComments: rightsData.update_article_comments === 1,
      removeArticleComments: rightsData.remove_article_comments === 1,
      updateArticleOwnComments: rightsData.update_article_own_comments === 1,
      removeArticleOwnComments: rightsData.remove_article_own_comments === 1
    }

    return res.status(200).send(rightsEdited);
  });
});

/****************************************************************************************************/

router.put('/update-email-address', (req, res) =>
{
  if(req.body.emailAddress == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'emailAddress' });

  commonAccountsUpdate.updateEmailAddress(req.body.emailAddress, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-lastname', (req, res) =>
{
  if(req.body.lastname == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'lastname' });

  commonAccountsUpdate.updateLastname(req.body.lastname, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-firstname', (req, res) =>
{
  if(req.body.firstname == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'firstname' });

  commonAccountsUpdate.updateFirstname(req.body.firstname, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-contact-number', (req, res) =>
{
  if(req.body.number == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'number' });

  commonAccountsUpdate.updateContactNumber(req.body.number, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-password', (req, res) =>
{
  if(req.body.oldPassword == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'oldPassword' });

  if(req.body.newPassword == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newPassword' });

  if(req.body.confirmationPassword == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'confirmationPassword' });

  commonAccountsUpdate.updatePassword(req.body.oldPassword, req.body.newPassword, req.body.confirmationPassword, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-picture', (req, res) =>
{
  if(req.body.picture == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'picture' });

  commonAccountsUpdate.updatePicture(req.body.picture, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.get('/get-password-rules', (req, res) =>
{
  res.status(200).send({ passwordRules: req.app.get('params').passwordRules });
});

/****************************************************************************************************/

module.exports = router;
