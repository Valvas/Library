'use strict'

const express                 = require('express');
const errors                  = require(`${__root}/json/errors`);
const success                 = require(`${__root}/json/success`);
const constants               = require(`${__root}/functions/constants`);
const commonBugsGetReports    = require(`${__root}/functions/common/bugs/getReports`);
const commonBugsUpdateReport  = require(`${__root}/functions/common/bugs/updateReport`);
const commonBugsCreateReport  = require(`${__root}/functions/common/bugs/createReport`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-reports-list', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  commonBugsGetReports.getReportsList(currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, resportsList) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send({ reportsList: resportsList });
  });
});

/****************************************************************************************************/

router.post('/create-report', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(req.body.reportMessage === undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportMessage' });
  }

  commonBugsCreateReport.createReport(req.body.reportMessage, currentAccount, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, reportData) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    req.app.get('io').in('intranetBugs').emit('reportCreated', reportData);

    return res.status(200).send({ message: success[constants.BUG_REPORT_CREATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.post('/get-report-detail', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(req.body.reportUuid === undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportUuid' });
  }

  commonBugsGetReports.getReportDetail(req.body.reportUuid, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, reportDetail) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send(reportDetail);
  });
});

/****************************************************************************************************/

router.post('/post-comment', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(req.body.reportUuid === undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportUuid' });
  }

  if(req.body.reportComment === undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportComment' });
  }

  commonBugsUpdateReport.updateReportPostComment(req.body.reportComment, req.body.reportUuid, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, logData) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    req.app.get('io').in('intranetBugs').emit('reportLogsUpdated', logData);

    return res.status(201).send({ message: success[constants.BUG_REPORT_COMMENT_POSTED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.post('/set-to-pending', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(currentAccount.isAdmin === false)
  {
    return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });
  }

  if(req.body.reportUuid === undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportUuid' });
  }

  commonBugsUpdateReport.updateReportSetToPending(req.body.reportUuid, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, logData) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    req.app.get('io').in('intranetBugs').emit('reportLogsUpdated', logData);

    return res.status(201).send({ message: success[constants.BUG_REPORT_STATUS_UPDATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.post('/set-to-closed', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(currentAccount.isAdmin === false)
  {
    return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });
  }

  if(req.body.reportUuid === undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportUuid' });
  }

  commonBugsUpdateReport.updateReportSetToClosed(req.body.reportUuid, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, logData) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    req.app.get('io').in('intranetBugs').emit('reportLogsUpdated', logData);

    return res.status(201).send({ message: success[constants.BUG_REPORT_STATUS_UPDATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.post('/set-to-resolved', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(currentAccount.isAdmin === false)
  {
    return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });
  }

  if(req.body.reportUuid === undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportUuid' });
  }

  commonBugsUpdateReport.updateReportSetToResolved(req.body.reportUuid, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, logData) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    req.app.get('io').in('intranetBugs').emit('reportLogsUpdated', logData);

    return res.status(201).send({ message: success[constants.BUG_REPORT_STATUS_UPDATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

module.exports = router;
