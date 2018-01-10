'use strict';

var express     = require('express');
var errors      = require(`${__root}/json/errors`);
var constants   = require(`${__root}/functions/constants`);

var app = express();

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  req.session.uuid != undefined ? next() : res.render('block', { message: `${errors[constants.AUTHENTICATION_REQUIRED].charAt(0).toUpperCase()}${errors[constants.AUTHENTICATION_REQUIRED].slice(1)}` });
};

/*****************************************************************************************************************************/