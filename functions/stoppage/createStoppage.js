'use strict'

const fs                  = require('fs');
const uuid                = require('uuid');

const stoppageStrings     = require(`${__root}/json/strings/stoppage`);
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFilesMove     = require(`${__root}/functions/common/files/move`);

/****************************************************************************************************/

function createStoppage(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback)
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

  if(attachments.length === 0)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_ATTACHMENT_REQUIRED, detail: null });
  }

  let amountOfInitialAttachment = 0;

  const correspondencesTypes = Object.keys(stoppageStrings.addStoppage.correspondences);

  for(let x = 0; x < attachments.length; x++)
  {
    if(correspondencesTypes.includes(attachments[x].correspondence) === false)
    {
      return callback({ status: 406, code: constants.CREATE_STOPPAGE_CORRESPONDENCE_TYPE_NOT_FOUND, detail: attachments[x].correspondence });
    }

    if(attachments[x].correspondence === 'started')
    {
      amountOfInitialAttachment += 1;
    }

    if(attachments[x].type === 'application/pdf') continue;

    return callback({ status: 406, code: constants.CREATE_STOPPAGE_UNAUTHORIZED_ATTACHMENTS, detail: null });
  }

  if(amountOfInitialAttachment === 0)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INITIAL_ATTACHMENT_REQUIRED, detail: null });
  }

  if(amountOfInitialAttachment > 1)
  {
    return callback({ status: 406, code: constants.CREATE_STOPPAGE_INITIAL_ATTACHMENT_OVERFLOW, detail: null });
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

    return createStoppageCheckStorageFolder(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createStoppageCheckStorageFolder(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback)
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

        return createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback);
      });
    }

    else
    {
      if(stats.isDirectory() === true)
      {
        return createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback);
      }

      fs.mkdir(`${globalParameters.storage.root}/${globalParameters.storage.stoppage}`, (error) =>
      {
        if(error !== null && error.code !== 'EEXIST')
        {
          return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });
        }

        return createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback);
      });
    }
  });
}

/****************************************************************************************************/

function createStoppageInsertIntoDatabase(registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback)
{
  const recordUuid = uuid.v4();

  let index = 0;

  const browseAttachments = () =>
  {
    const attachmentUuid = uuid.v4();

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.stoppage.label,
      tableName: globalParameters.database.stoppage.tables.attachment,
      args:
      {
        uuid: attachmentUuid,
        record: recordUuid,
        name: attachments[index].name.split('.').slice(0, attachments[index].name.split('.').length - 1).join(''),
        comment: attachments[index].comment,
        type: attachments[index].correspondence
      }

    }, databaseConnection, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
      }

      attachments[index].uuid = attachmentUuid;

      if(attachments[index += 1] === undefined)
      {
        return createStoppageProcessAttachments(recordUuid, registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback);
      }

      browseAttachments();
    });
  }

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

    browseAttachments();
  });
}

/****************************************************************************************************/

function createStoppageProcessAttachments(recordUuid, registrationNumber, employeeFirstname, employeeLastname, employeeIsMale, establishmentUuid, incidentType, startDate, sentDate, endDate, attachments, databaseConnection, globalParameters, callback)
{
  let index = 0;

  const browseAttachments = () =>
  {
    commonFilesMove.moveFile(attachments[index].path, `${globalParameters.storage.root}/${globalParameters.storage.stoppage}/${recordUuid}/${attachments[index].uuid}.pdf`, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });
      }

      if(attachments[index += 1] === undefined)
      {
        const recordData =
        {

        }

        return callback(null, recordData);
      }

      browseAttachments();
    });
  }

  fs.mkdir(`${globalParameters.storage.root}/${globalParameters.storage.stoppage}/${recordUuid}`, (error) =>
  {
    if(error !== null && error.code !== 'EEXIST')
    {
      return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });
    }

    browseAttachments();
  });
}

/****************************************************************************************************/

module.exports =
{
  createStoppage: createStoppage
}
