'use strict'

const fs          = require('fs');
const express     = require('express');
const formidable  = require('formidable');

const errors          = require(`${__root}/json/errors`);
const success         = require(`${__root}/json/success`);
const constants       = require(`${__root}/functions/constants`);
const getStoppage     = require(`${__root}/functions/stoppage/getStoppage`);
const createStoppage  = require(`${__root}/functions/stoppage/createStoppage`);

let router = express.Router();

/****************************************************************************************************/

router.get('/get-stoppages-list', (req, res) =>
{
  getStoppage.getStoppagesList(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, stoppagesList) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send({ stoppagesList: stoppagesList });
  });
});

/****************************************************************************************************/

router.post('/get-stoppage-detail', (req, res) =>
{
  if(req.body.stoppageUuid === undefined)
  {
    return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });
  }

  getStoppage.getStoppageDetail(req.body.stoppageUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, stoppageDetail) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send(stoppageDetail);
  });
});

/****************************************************************************************************/

router.get('/get-establishments-list', (req, res) =>
{
  getStoppage.getEstablishmentsList(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, establishmentsList) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    return res.status(200).send({ establishmentsList: establishmentsList });
  });
});

/****************************************************************************************************/

router.post('/create-stoppage', (req, res) =>
{
  const form = new formidable.IncomingForm();

  form.uploadDir = `${req.app.get('params').storage.root}/${req.app.get('params').storage.tmp}`;

  form.parse(req, (error, fields, files) =>
  {
    if(error !== null)
    {
      return res.status(500).send({ message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: error.message });
    }

    if(fields.registrationNumber === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'registrationNumber' });
    }

    if(fields.employeeFirstname === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'employeeFirstname' });
    }

    if(fields.employeeLastname === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'employeeLastname' });
    }

    if(fields.employeeIsMale === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'employeeIsMale' });
    }

    if(fields.establishment === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'establishment' });
    }

    if(fields.incidentType === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'incidentType' });
    }

    if(fields.startDate === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'startDate' });
    }

    if(fields.sentDate === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'sentDate' });
    }

    if(fields.endDate === undefined)
    {
      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'endDate' });
    }

    const attachment =
    {
      name: files.attachmentFile.name,
      path: files.attachmentFile.path,
      type: files.attachmentFile.type,
      comment: fields.attachmentComment
    }

    createStoppage.createStoppage(fields.registrationNumber, fields.employeeFirstname.toLowerCase(), fields.employeeLastname.toLowerCase(), fields.employeeIsMale === 'true', fields.establishment, fields.incidentType, fields.startDate, fields.sentDate, fields.endDate, attachment, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, stoppageData) =>
    {
      if(error !== null)
      {
        return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
      }

      return res.status(201).send({ message: success[constants.STOPPAGE_CREATED_SUCCESSFULLY] });
    });
  });
});

/****************************************************************************************************/

router.get('/visualize-attachment/:recordUuid/:attachmentUuid', (req, res) =>
{
  res.set('Content-Type', 'application/pdf');

  fs.readFile(`${req.app.get('params').storage.root}/${req.app.get('params').storage.stoppage}/${req.params.recordUuid}/${req.params.attachmentUuid}.pdf`, (error, data) =>
  {
    return res.send(data);
  });
});

/****************************************************************************************************/

router.get('/download-attachment/:recordUuid/:attachmentUuid/:attachmentName', (req, res) =>
{
  return res.download(`${req.app.get('params').storage.root}/${req.app.get('params').storage.stoppage}/${req.params.recordUuid}/${req.params.attachmentUuid}.pdf`, `${req.params.attachmentName}.pdf`);
});

/****************************************************************************************************/

module.exports = router;
