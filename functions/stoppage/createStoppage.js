'use strict'

const fs                  = require('fs');
const uuid                = require('uuid');

const stoppageStrings     = require(`${__root}/json/strings/stoppage`);
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFilesMove     = require(`${__root}/functions/common/files/move`);

/****************************************************************************************************/

function createStoppage(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback)
{
  const newStartDate = new Date(startDate);
  const newSentDate  = new Date(sentDate);
  const newEndDate   = new Date(endDate);

  if(new RegExp('^[0-9]{4,10}$').test(registrationNumber) === false)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_REGISTRATION_NUMBER, detail: null });
  }

  if(new RegExp('^[a-zéèàùçâêîôûäëïöüñõ]+(-)?[a-zéèàùçâêîôûäëïöüñõ]+$').test(employeeFirstname) === false)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_FIRSTNAME, detail: null });
  }

  if(new RegExp('^[a-zéèàùçâêîôûäëïöüñõ]+(-)?[a-zéèàùçâêîôûäëïöüñõ]+$').test(employeeLastname) === false)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_LASTNAME, detail: null });
  }

  if(employeeIsMale !== true && employeeIsMale !== false)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_GENDER, detail: null });
  }

  if(incidentType !== 'commuting' && incidentType !== 'work' && incidentType !== 'sick')
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_TYPE, detail: null });
  }

  if(startDate.toString() === 'Invalid Date')
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_START_DATE, detail: null });
  }

  if(sentDate.toString() === 'Invalid Date')
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_SENT_DATE, detail: null });
  }

  if(endDate.toString() === 'Invalid Date')
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INVALID_END_DATE, detail: null });
  }

  if(newStartDate > newSentDate)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_START_DATE_AFTER_SENT_DATE, detail: null });
  }

  if(newStartDate > newEndDate)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_START_DATE_AFTER_END_DATE, detail: null });
  }

  if(attachment.type !== 'application/pdf')
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_UNAUTHORIZED_ATTACHMENTS, detail: null });
  }

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.establishment,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: establishmentUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return callback({ status: 404, code: constants.CREATE_STOPPAGE_ESTABLISHMENT_NOT_FOUND, detail: null });
    }

    return createStoppageCheckStorageFolder(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createStoppageCheckStorageFolder(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback)
{
  fs.stat(`${globalParameters.storage.root}/${globalParameters.storage.stoppage}`, (error, stats) =>
  {
    if(error !== null && error.code !== 'ENOENT')
    {
      return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });
    }

    else if(error !== null && error.code === 'ENOENT')
    {
      fs.mkdir(`${globalParameters.storage.root}/${globalParameters.storage.stoppage}`, (error) =>
      {
        if(error !== null && error.code !== 'EEXIST')
        {
          return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });
        }

        return createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback);
      });
    }

    else
    {
      if(stats.isDirectory() === true)
      {
        return createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback);
      }

      fs.mkdir(`${globalParameters.storage.root}/${globalParameters.storage.stoppage}`, (error) =>
      {
        if(error !== null && error.code !== 'EEXIST')
        {
          return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });
        }

        return createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback);
      });
    }
  });
}

/****************************************************************************************************/

function createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback)
{
  const recordUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.list,
    args:
    {
      uuid: recordUuid,
      establishment: establishmentUuid,
      identifier: registrationNumber,
      firstname: employeeFirstname,
      lastname: employeeLastname,
      gender: employeeIsMale ? 1 : 0,
      start: startDate,
      received: sentDate,
      end: endDate,
      type: incidentType,
      cpam: ''
    }

  }, databaseConnection, (error) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    const attachmentUuid = uuid.v4();

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.stoppage.label,
      tableName: globalParameters.database.stoppage.tables.attachment,
      args:
      {
        uuid: attachmentUuid,
        record: recordUuid,
        name: attachment.name.split('.').slice(0, attachment.name.split('.').length - 1).join(''),
        comment: attachment.comment,
        date: Date.now(),
        type: 'started'
      }

    }, databaseConnection, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
      }

      attachment.uuid = attachmentUuid;

      return createStoppageProcessAttachment(recordUuid, registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function createStoppageProcessAttachment(recordUuid, registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachment, databaseConnection, globalParameters, callback)
{
  fs.mkdir(`${globalParameters.storage.root}/${globalParameters.storage.stoppage}/${recordUuid}`, (error) =>
  {
    if(error !== null && error.code !== 'EEXIST')
    {
      return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });
    }

    commonFilesMove.moveFile(attachment.path, `${globalParameters.storage.root}/${globalParameters.storage.stoppage}/${recordUuid}/${attachment.uuid}.pdf`, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });
      }

      const recordData =
      {

      }

      return callback(null, recordData);
    });
  });
}

/****************************************************************************************************/

module.exports =
{
  createStoppage: createStoppage
}
