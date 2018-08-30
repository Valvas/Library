'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);

var router = express.Router();

/****************************************************************************************************/

router.put('/get-news-data', (req, res) =>
{
  if(req.body.newsUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  else
  {
    commonNewsGet.getNewsData(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else if(newsExists == false) res.status(404).send({ message: errors[constants.NEWS_NOT_FOUND], detail: null });

      else
      {
        res.status(200).send({ newsData: newsData });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;