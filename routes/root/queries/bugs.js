'use strict'

const express                 = require('express');
const errors                  = require(`${__root}/json/errors`);
const success                 = require(`${__root}/json/success`);
const constants               = require(`${__root}/functions/constants`);
const commonBugsGetReports    = require(`${__root}/functions/common/bugs/getReports`);
const commonBugsCreateReport  = require(`${__root}/functions/common/bugs/createReport`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-reports-list', (req, res) =>
{
  commonBugsGetReports.getReportsList(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, resportsList) =>
  {
    if(error != null)
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

  if(req.body.reportMessage == undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportMessage' });
  }

  commonBugsCreateReport.createReport(req.body.reportMessage, currentAccount, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, reportData) =>
  {
    if(error != null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send({ message: success[constants.BUG_REPORT_CREATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.post('/get-report-detail', (req, res) =>
{
  if(req.body.reportUuid == undefined)
  {
    return res.status(404).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'reportUuid' });
  }

  commonBugsGetReports.getReportDetail(req.body.reportUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, reportDetail) =>
  {
    if(error != null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send(reportDetail);
  });
});

/****************************************************************************************************/

module.exports = router;
