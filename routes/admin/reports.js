'use strict';

var express               = require('express');
var admin                 = require(`${__root}/json/admin`);
var params                = require(`${__root}/json/config`);
var errors                = require(`${__root}/json/errors`);
var success               = require(`${__root}/json/success`);
var logon                 = require(`${__root}/functions/logon`);
var report                = require(`${__root}/functions/report`);
var constants             = require(`${__root}/functions/constants`);
var reportsGet            = require(`${__root}/functions/reports/get`);
var reportsUpdate         = require(`${__root}/functions/reports/update`);
var commentsUpdate        = require(`${__root}/functions/comments/update`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  report.getReports(req.app.get('mysqlConnector'), (reportsOrFalse, errorStatus, errorCode) =>
  {
    reportsOrFalse == false ?
    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
    res.render('admin/reports', { navigationLocation: 'admin', asideLocation: 'reports', links: require(`${__root}/json/admin`).aside, reports: reportsOrFalse, status: params.reports_status, types: params.reports_type });
  });
});

/****************************************************************************************************/

router.get('/:report', (req, res) =>
{
  reportsGet.getReportForAdminUsingUUID(req.params.report, req.app.get('mysqlConnector'), (reportOrFalse, errorStatus, errorCode) =>
  {
    reportOrFalse == false ?
    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
    res.render('admin/report', { navigationLocation: 'admin', asideLocation: 'reports', links: require(`${__root}/json/admin`).aside, report: reportOrFalse, status: params.reports_status, types: params.reports_type });
  });
});

/****************************************************************************************************/

router.put('/update-comment-status', (req, res) =>
{
  commentsUpdate.updateCommentStatus(req.body.commentID, req.body.commentStatus, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
  {
    boolean ?
    res.status(200).send({ result: true, message: `${success[constants.COMMENT_STATUS_UPDATED].charAt(0).toUpperCase()}${success[constants.COMMENT_STATUS_UPDATED].slice(1)}` }) :
    res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
  });
});

/****************************************************************************************************/

router.put('/update-report-status', (req, res) =>
{
  reportsUpdate.updateReportStatus(req.body.reportUUID, req.body.reportStatus, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
  {
    boolean ?
    res.status(200).send({ result: true, message: `${success[constants.REPORT_STATUS_UPDATED].charAt(0).toUpperCase()}${success[constants.REPORT_STATUS_UPDATED].slice(1)}` }) :
    res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
  });
});

/****************************************************************************************************/

module.exports = router;