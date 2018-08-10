'use strict';

var express     = require('express');
var errors      = require(`${__root}/json/errors`);
var constants   = require(`${__root}/functions/constants`);

var app = express();

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  req.session.account != undefined ? next() : res.render('block', { message: errors[constants.AUTHENTICATION_REQUIRED], detail: null, link: '/' });
};

/*****************************************************************************************************************************/