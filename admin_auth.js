'use strict';

const express = require('express');

let accountRights = require('./functions/accounts/rights');

let app = express();

/*****************************************************************************************************************************/

module.exports = function(req, res, next)
{
  accountRights.checkIfUserIsAdmin(req.session.uuid, req.app.get('mysqlConnector'), function(success, code)
  {
    if(success) next();

    else
    {
      switch(code)
      {
        case 0: res.render('block', { message: `Erreur interne du serveur, veuillez réessayer` });
        case 1: res.render('block', { message: `La requête ne peut pas être traitée car des données sont manquantes` });
        case 2: res.render('block', { message: `Compte introuvable` });
        case 5: res.render('block', { message: `Vous devez posséder des droits d'administrateur pour accéder à cette page` });
      }
    }
  });
};

/*****************************************************************************************************************************/