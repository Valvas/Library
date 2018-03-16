'use strict'

const fs                      = require('fs');
const constants               = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.createFile = (fileName, folderPath, callback) =>
{
  fileName    == undefined ||
  folderPath  == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  //Check if parent folder exists
  fs.stat(folderPath, (error, stats) =>
  {
    if(error) callback({ status: 500, code: constants.FOLDER_NOT_FOUND, detail: error.message });

    else
    {
      //Check if parent folder is a directory
      if(stats.isDirectory() == false) callback({ status: 500, code: constants.IS_NOT_A_DIRECTORY });

      else
      {
        //Check if we have read and write access on the parent folder
        fs.access(folderPath, fs.constants.R_OK | fs.constants.W_OK, (error) => 
        {
          if(error) callback({ status: 500, code: constants.UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET, detail: error.message });

          else
          {
            //Check if the file to create already exists
            fs.stat(`${folderPath}/${fileName}`, (error, stats) =>
            {
              if(error && error.code != 'ENOENT') callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

              //File exists
              else if(stats)
              {
                //Check if the folder is a directory
                if(stats.isDirectory() == true) callback({ status: 500, code: constants.IS_A_DIRECTORY });

                else
                {
                  //Check if we have read and write access on the file
                  fs.access(`${folderPath}/${fileName}`, fs.constants.R_OK | fs.constants.W_OK, (error) => 
                  {
                    error ? callback({ status: 500, code: constants.UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET, detail: error.message }) : callback(null);
                  });
                }
              }

              //File does not exist and must be created
              else
              {
                fs.open(`${folderPath}/${fileName}`, 'a', (error, fd) =>
                {
                  error ? callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message }) : 
                  
                  fs.close(fd, (error) =>
                  {
                    error ? callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message }) : callback(null);
                  });
                });
              }
            });
          }
        });
      }
    }
  });
}

/****************************************************************************************************/