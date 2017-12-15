'use strict';

var express = require('express');

var app = express();

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  req.session.uuid != undefined ? next() : res.render('block', { message: `Erreur [401] - L'accès à cette page requiert une authentification` });
};

/*****************************************************************************************************************************/