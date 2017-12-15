'use strict';

var express               = require('express');
var params                = require(`${__root}/json/config`);
var errors                = require(`${__root}/json/errors`);
var success               = require(`${__root}/json/success`);
var logon                 = require(`${__root}/functions/logon`);
var report                = require(`${__root}/functions/report`);
var constants             = require(`${__root}/functions/constants`);
var reportsCreate         = require(`${__root}/functions/reports/create`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  report.getReports(req.app.get('mysqlConnector'), (reportsOrFalse, errorStatus, errorCode) =>
  {
    reportsOrFalse == false ?
    res.render('block', { message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` }) :
    res.render('reports', { navigationLocation: 'reports', asideLocation: '', links: require('../json/services'), reports: reportsOrFalse, status: params.reports_status, types: params.reports_type });
  });
});

/****************************************************************************************************/

router.post('/', (req, res) =>
{
  reportsCreate.createNewReport(req.body.reportType, req.body.reportSubject, req.body.reportContent, req.session.uuid, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
  {
    boolean ?
    res.status(201).send({ result: true, message: success[constants.SUCCESS_POSTING_REPORT].charAt(0).toUpperCase() + success[constants.SUCCESS_POSTING_REPORT].slice(1) }) :
    res.status(errorStatus).send({ result: false, message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` });
  });
});

/****************************************************************************************************/

router.get('/:report', (req, res) =>
{
  report.getReport(req.params.report, req.app.get('mysqlConnector'), (falseOrReportObject, errorStatus, errorCode) =>
  {
    falseOrReportObject == false ?
    res.render('block', { message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` }) :
    res.render('report', { navigationLocation: 'reports', asideLocation: '', links: require('../json/services'), report: falseOrReportObject, status: params.reports_status, types: params.reports_type });
  });
});

/****************************************************************************************************/

router.post('/add-comment', (req, res) =>
{
  report.addComment(req.body.report, req.body.comment, req.session.uuid, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
  {
    boolean ?
    res.status(201).send({ result: true, message: `${success[constants.COMMENT_ADDED].charAt(0).toUpperCase()}${success[constants.COMMENT_ADDED].slice(1)}` }) :
    res.status(errorStatus).send({ result: false, message: errors[errorCode] });
  });
});

/****************************************************************************************************/

module.exports = router;