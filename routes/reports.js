'use strict';

let express           = require('express');
let config            = require('../json/config');
let errors            = require('../json/errors');
let success           = require('../json/success');
let logon             = require('../functions/logon');
let report            = require('../functions/report');
let constants         = require('../functions/constants');

let router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  report.getReports(req.app.get('mysqlConnector'), (trueOrFalse, rowsOrErrorCode) =>
  {
    trueOrFalse ?
    res.render('reports', { location: 'reports', links: require('../json/services'), reports: rowsOrErrorCode, status: config.reports_status }) :
    res.render('block', { message: errors[rowsOrErrorCode].charAt(0).toUpperCase() + errors[rowsOrErrorCode].slice(1) });
  });
});

/****************************************************************************************************/

router.post('/', (req, res) =>
{
  req.body.reportType == undefined || req.body.reportSubject == undefined || req.body.reportContent == undefined ? 

  res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST] }) :

  report.saveReport(req.body.reportType, req.body.reportSubject, req.body.reportContent, req.session.uuid, req.app.get('mysqlConnector'), (trueOrFalse, errorCodeOrReportUUID) =>
  {
    trueOrFalse ?
    res.status(201).send({ result: true, message: success[constants.SUCCESS_POSTING_REPORT].charAt(0).toUpperCase() + success[constants.SUCCESS_POSTING_REPORT].slice(1) }) :
    res.status(500).send({ result: false, message: errors[errorCodeOrReportUUID].charAt(0).toUpperCase() + errors[errorCodeOrReportUUID].slice(1) });
  });
});

/****************************************************************************************************/

module.exports = router;