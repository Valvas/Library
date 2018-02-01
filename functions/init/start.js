'use strict'

const fs              = require('fs');
const express         = require('express');
const encryption      = require(`${__root}/functions/encryption`);

/****************************************************************************************************/

module.exports.startInit = (app, callback) =>
{
  var init = require(`${__root}/routes/init`);

  encryption.getInitPassword((password) =>
  {
    fs.open(`${__root}/password`, 'w', (err, fd) =>
    {
      if(err) callback({ message: err.message });

      else
      {
        fs.write(fd, password, (err) =>
        {
          if(err) callback({ message: err.message });

          else
          {
            app.use('/init', init);
            app.use((req, res, next) => { res.redirect('/init/logon'); });

            callback();
          }
        });
      }
    });
  });
}

/****************************************************************************************************/