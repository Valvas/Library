'use strict';

const express = require('express');

let app = express();

/*****************************************************************************************************************************/

module.exports = function(req, res, next)
{
  req.session.identifier != undefined ? next() : res.render('block');
};

/*****************************************************************************************************************************/