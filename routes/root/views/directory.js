'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonUnitsGet        = require(`${__root}/functions/common/units/get`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    commonUnitsGet.getUnitsTree(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, unitsTree) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      var browseUnits = (currentUnit, tag, callback) =>
      {
        var resultArray = [];

        var index = 0;

        var loop = () =>
        {
          if(typeof(currentUnit[index]) === 'string')
          {
            if(currentUnit[index + 1] != undefined && typeof(currentUnit[index + 1]) !== 'string')
            {
              tag === '0'
              ? resultArray.push(`<li id="selectedList">`)
              : resultArray.push(`<li>`);
              tag === '0'
              ? resultArray.push(`<span id="selectedUnit" class="directoryUnitValueSelected" onclick="deployUnit()" tag="${tag}">`)
              : resultArray.push(`<span class="directoryUnitValue" onclick="deployUnit()" tag="${tag}">`);
              tag === '0'
              ? resultArray.push(`<span class="directoryUnitValueIcon"><i class="fas fa-caret-down"></i></span>`)
              : resultArray.push(`<span class="directoryUnitValueIcon"><i class="fas fa-caret-right"></i></span>`);
              resultArray.push(`<span class="directoryUnitValueLabel">${currentUnit[index]}</span>`);
              resultArray.push(`</span>`);
              tag === '0'
              ? resultArray.push(`<ul class="directoryUnit">`)
              : resultArray.push(`<ul class="directoryUnitHidden">`);

              index += 1;

              loop();
            }

            else
            {
              resultArray.push(`<li class="directoryUnitValue" onclick="deployUnit()" tag="${tag}">${currentUnit[index]}</li>`);

              tag = `${tag.slice(0,-1)}${parseInt(tag[tag.length - 1]) + 1}`;

              if(currentUnit[index += 1] == undefined) return callback(resultArray);

              loop();
            }
          }

          else
          {
            browseUnits(currentUnit[index], `${tag}0`, (result) =>
            {
              tag = `${tag.slice(0,-1)}${parseInt(tag[tag.length - 1] + 1)}`;

              resultArray.push(result.join('\n'));
              resultArray.push(`</ul>`);
              resultArray.push(`</li>`);

              if(currentUnit[index += 1] == undefined) return callback(resultArray);

              loop();
            });
          }
        }

        loop();
      }

      browseUnits(unitsTree, '0', (unitsHtml) =>
      {
        commonAccountsGet.getAccountsWithUnit(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
        {
          if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

          res.render('root/directory/home',
          {
            account: req.app.locals.account,
            currentLocation: 'directory',
            strings: { common: commonStrings },
            news: news,
            accounts: accounts,
            unitsHtml: unitsHtml.join('\n')
          });
        });
      });
    });
  });
});

/****************************************************************************************************/

router.get('/:accountUuid', (req, res) =>
{
  commonAccountsGet.checkIfAccountExistsFromUuid(req.params.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    if(accountExists == false) return res.render('block', { message: errors[ConstantSourceNode.ACCOUNT_NOT_FOUND], detail: null, link: req.headers.referer });

    commonUnitsGet.getAccountUnit(req.params.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountUnit) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      accountData.unit = accountUnit;

      commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
      {
        if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        res.render('root/directory/account',
        {
          account: req.app.locals.account,
          currentLocation: 'directory',
          strings: { common: commonStrings },
          news: news,
          accountData: accountData
        });
      });
    });
  });
});

/****************************************************************************************************/

module.exports = router;