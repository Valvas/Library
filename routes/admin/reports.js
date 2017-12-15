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

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  report.getReports(req.app.get('mysqlConnector'), (reportsOrFalse, errorStatus, errorCode) =>
  {
    reportsOrFalse == false ?
    res.render('block', { message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` }) :
    res.render('admin/reports', { navigationLocation: 'admin', asideLocation: 'reports', links: require(`${__root}/json/admin`).aside, reports: reportsOrFalse, status: params.reports_status, types: params.reports_type });
  });
});

/****************************************************************************************************/

router.get('/:report', (req, res) =>
{
  reportsGet.getReportForAdminUsingUUID(req.params.report, req.app.get('mysqlConnector'), (reportOrFalse, errorStatus, errorCode) =>
  {
    reportOrFalse == false ?
    res.render('block', { message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` }) :
    res.render('admin/report', { navigationLocation: 'admin', asideLocation: 'reports', links: require(`${__root}/json/admin`).aside, report: reportOrFalse, status: params.reports_status, types: params.reports_type });
  });
});

/****************************************************************************************************/

module.exports = router;