'use strict';

const express = require('express');

let app = express();

/*****************************************************************************************************************************/

module.exports = function(req, res, next)
{
  req.session.uuid != undefined ? next() : res.render('block', { message: `L'accès à cette page requiert une authentification` });
};

/*****************************************************************************************************************************/