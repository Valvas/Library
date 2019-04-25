'use strict'

const Assert = require('assert');

const DateFormat  = require(`../functions/common/format/date`);
const EmailFormat = require(`../functions/common/format/email`);

/****************************************************************************************************/

describe('Format', () =>
{
  /**************************************************/

  describe('Get stringified datetime from timestamp async', () =>
  {
    it('Should return "23/04/2019 - 10:15:37" from timestamp "1556007337244"', (done) =>
    {
      DateFormat.getStringifiedDateTimeFromTimestampAsync(1556007337244, (error, stringifiedTimestamp) =>
      {
        Assert.equal(stringifiedTimestamp, '23/04/2019 - 10:15:37');
        done();
      });
    });

    it('Should return "27/08/2012 - 11:05:38" from timestamp "1346058338970"', (done) =>
    {
      DateFormat.getStringifiedDateTimeFromTimestampAsync(1346058338970, (error, stringifiedTimestamp) =>
      {
        Assert.equal(stringifiedTimestamp, '27/08/2012 - 11:05:38');
        done();
      });
    });

    it('Should return "29/12/2018 - 05:05:38" from timestamp "1546056338274"', (done) =>
    {
      DateFormat.getStringifiedDateTimeFromTimestampAsync(1546056338274, (error, stringifiedTimestamp) =>
      {
        Assert.equal(stringifiedTimestamp, '29/12/2018 - 05:05:38');
        done();
      });
    });
  });

  /**************************************************/

  describe('Get stringified date from timestamp async', () =>
  {
    it('Should return "23/04/2019" from timestamp "1556007337244"', (done) =>
    {
      DateFormat.getStringifiedDateFromTimestampAsync(1556007337244, (error, stringifiedTimestamp) =>
      {
        Assert.equal(stringifiedTimestamp, '23/04/2019');
        done();
      });
    });

    it('Should return "27/08/2012" from timestamp "1346058338970"', (done) =>
    {
      DateFormat.getStringifiedDateFromTimestampAsync(1346058338970, (error, stringifiedTimestamp) =>
      {
        Assert.equal(stringifiedTimestamp, '27/08/2012');
        done();
      });
    });

    it('Should return "29/12/2018" from timestamp "1546056338274"', (done) =>
    {
      DateFormat.getStringifiedDateFromTimestampAsync(1546056338274, (error, stringifiedTimestamp) =>
      {
        Assert.equal(stringifiedTimestamp, '29/12/2018');
        done();
      });
    });
  });

  /**************************************************/

  describe('Get stringified datetime from timestamp sync', () =>
  {
    it('Should return "23/04/2019 - 10:15:37" from timestamp "1556007337244"', (done) =>
    {
      Assert.equal(DateFormat.getStringifiedDateTimeFromTimestampSync(1556007337244), '23/04/2019 - 10:15:37');
      done();
    });

    it('Should return "27/08/2012 - 11:05:38" from timestamp "1346058338970"', (done) =>
    {
      Assert.equal(DateFormat.getStringifiedDateTimeFromTimestampSync(1346058338970), '27/08/2012 - 11:05:38');
      done();
    });

    it('Should return "29/12/2018 - 05:05:38" from timestamp "1546056338274"', (done) =>
    {
      Assert.equal(DateFormat.getStringifiedDateTimeFromTimestampSync(1546056338274), '29/12/2018 - 05:05:38');
      done();
    });
  });

  /**************************************************/

  describe('Get stringified date from timestamp sync', () =>
  {
    it('Should return "23/04/2019" from timestamp "1556007337244"', (done) =>
    {
      Assert.equal(DateFormat.getStringifiedDateFromTimestampSync(1556007337244), '23/04/2019');
      done();
    });

    it('Should return "27/08/2012" from timestamp "1346058338970"', (done) =>
    {
      Assert.equal(DateFormat.getStringifiedDateFromTimestampSync(1346058338970), '27/08/2012');
      done();
    });

    it('Should return "29/12/2018" from timestamp "1546056338274"', (done) =>
    {
      Assert.equal(DateFormat.getStringifiedDateFromTimestampSync(1546056338274), '29/12/2018');
      done();
    });
  });

  /**************************************************/

  describe('Check email address format', () =>
  {
    it('Should return false when testing email address "test"', (done) =>
    {
      EmailFormat.checkEmailAddressFormat('test', (error, isValid) =>
      {
        Assert.equal(isValid, false);
        done();
      });
    });

    it('Should return false when testing email address "test@"', (done) =>
    {
      EmailFormat.checkEmailAddressFormat('test@', (error, isValid) =>
      {
        Assert.equal(isValid, false);
        done();
      });
    });

    it('Should return false when testing email address "t@t"', (done) =>
    {
      EmailFormat.checkEmailAddressFormat('t@t', (error, isValid) =>
      {
        Assert.equal(isValid, false);
        done();
      });
    });

    it('Should return false when testing email address "test@test"', (done) =>
    {
      EmailFormat.checkEmailAddressFormat('test@test', (error, isValid) =>
      {
        Assert.equal(isValid, false);
        done();
      });
    });

    it('Should return false when testing email address "1@-fdg"', (done) =>
    {
      EmailFormat.checkEmailAddressFormat('1@-fdg', (error, isValid) =>
      {
        Assert.equal(isValid, false);
        done();
      });
    });

    it('Should return true when testing email address "test@test.fr"', (done) =>
    {
      EmailFormat.checkEmailAddressFormat('test@test.fr', (error, isValid) =>
      {
        Assert.equal(isValid, true);
        done();
      });
    });

    it('Should return true when testing email address "test54@test.com"', (done) =>
    {
      EmailFormat.checkEmailAddressFormat('test54@test.com', (error, isValid) =>
      {
        Assert.equal(isValid, true);
        done();
      });
    });
  });

  /**************************************************/
});

/****************************************************************************************************/
