'use strict';

var express           = require('express');
var config            = require(`${__root}/json/config`);
var errors            = require(`${__root}/json/errors`);
var success           = require(`${__root}/json/success`);
var filesGet          = require(`${__root}/functions/files/get`);
var constants         = require(`${__root}/functions/constants`);
var filesLogs         = require(`${__root}/functions/files/logs`);
var formatDate        = require(`${__root}/functions/format/date`);
var filesComment      = require(`${__root}/functions/files/comment`);
var accountsRights    = require(`${__root}/functions/accounts/rights`);

var router = express.Router();

/****************************************************************************************************/

router.post('/post-comment', (req, res) =>
{
  accountsRights.getUserRightsTowardsService(req.body.service, req.session.uuid, req.app.get('mysqlConnector'), (rightsOrFalse, errorStatus, errorCode) =>
  {
    if(rightsOrFalse == false) res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });

    else
    {
      if(rightsOrFalse.post_comments == 0) res.status(403).send({ result: false, message: `${errors[constants.UNAUTHORIZED_TO_POST_COMMENTS].charAt(0).toUpperCase()}${errors[constants.UNAUTHORIZED_TO_POST_COMMENTS].slice(1)}` });

      else
      {
        filesComment.addComment(req.body.file, req.session.uuid, req.body.comment, req.app.get('mysqlConnector'), (logIdOrFalse, errorStatus, errorCode) =>
        {
          logIdOrFalse == false ?
          res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
          res.status(201).send({ result: true, message: `${success[constants.FILE_COMMENT_SUCCESSFULLY_ADDED].charAt(0).toUpperCase()}${success[constants.FILE_COMMENT_SUCCESSFULLY_ADDED].slice(1)}`, log: logIdOrFalse });
        });
      }
    }
  });
});

/****************************************************************************************************/

router.put('/get-log', (req, res) =>
{
  filesLogs.getFileLog(req.body.log, req.app.get('mysqlConnector'), (preparedLogOrFalse, errorStatus, errorCode) =>
  {
    preparedLogOrFalse == false ?

    res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

    res.status(200).send({ result: true, log: preparedLogOrFalse });
  });
});

/****************************************************************************************************/

router.get('/:file', (req, res) =>
{
  filesGet.getFile(req.params.file, req.session.uuid, req.app.get('mysqlConnector'), (fileOrFalse, errorStatus, errorCode) =>
  {
    fileOrFalse == false ?

    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

    accountsRights.getUserRightsTowardsService(fileOrFalse.service, req.session.uuid, req.app.get('mysqlConnector'), (rightsOrFalse, errorStatus, errorCode) =>
    {
      rightsOrFalse == false ?
      
      res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

      res.render('file', { navigationLocation: 'services', asideLocation: fileOrFalse.service, file: fileOrFalse, links: require(`${__root}/json/services`), ext: config['file_ext'], rights: rightsOrFalse });
    });
  });
});

/****************************************************************************************************/

module.exports = router;