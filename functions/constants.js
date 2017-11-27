/******************************************************************************************
ERRORS
/******************************************************************************************/

const SQL_SERVER_ERROR                                                            = 10001;
const ACCOUNT_NOT_FOUND                                                           = 10002;
const FILE_NOT_FOUND_ON_DISK                                                      = 10003;
const FILE_NOT_FOUND_IN_DATABASE                                                  = 10004;
const FILE_NOT_DELETED_FROM_DISK                                                  = 10005;
const FILE_NOT_DELETED_FROM_DATABASE                                              = 10006;
const UNAUTHORIZED_TO_DELETE_FILES                                                = 10007;
const NO_FILE_PROVIDED_IN_REQUEST                                                 = 10008;
const MISSING_DATA_IN_REQUEST                                                     = 10009;
const SERVICE_NOT_FOUND                                                           = 10010;
const UNAUTHORIZED_TO_ACCESS_SERVICE                                              = 10011;
const USER_IS_NOT_ADMIN                                                           = 10012;
const UNAUTHORIZED_TO_ADD_FILES                                                   = 10013;
const FAILED_TO_MOVE_FILE_FROM_TMP                                                = 10014;
const FAILED_TO_DELETE_FILE_FROM_TMP                                              = 10015;
const FILE_ALREADY_EXISTS                                                         = 10016;
const FILE_SYSTEM_ERROR                                                           = 10017;
const OLD_FILE_NOT_DELETED_FROM_DISK                                              = 10018;
const OLD_FILE_NOT_DELETED_FROM_DATABASE                                          = 10019;

/******************************************************************************************
SUCCESS
/******************************************************************************************/

const FILE_DELETED_FROM_DISK                                                      = 20001;
const FILE_DELETED_FROM_DATABASE                                                  = 20002;
const AUTHORIZED_TO_DELETE_FILES                                                  = 20003;
const FILE_FOUND_IN_THE_DATABASE                                                  = 20004;
const FILE_DELETED                                                                = 20005;
const USER_IS_ADMIN                                                               = 20006;
const FILE_ADDED_ON_DISK                                                          = 20007;
const AUTHORIZED_TO_ADD_FILES                                                     = 20008;

/******************************************************************************************
EXPORTS
/******************************************************************************************/

module.exports = 
{
  SQL_SERVER_ERROR: SQL_SERVER_ERROR,
  ACCOUNT_NOT_FOUND: ACCOUNT_NOT_FOUND,
  FILE_NOT_FOUND_ON_DISK: FILE_NOT_FOUND_ON_DISK,
  FILE_NOT_FOUND_IN_DATABASE: FILE_NOT_FOUND_IN_DATABASE,
  FILE_NOT_DELETED_FROM_DISK: FILE_NOT_DELETED_FROM_DISK,
  FILE_NOT_DELETED_FROM_DATABASE: FILE_NOT_DELETED_FROM_DATABASE,
  UNAUTHORIZED_TO_DELETE_FILES: UNAUTHORIZED_TO_DELETE_FILES,
  NO_FILE_PROVIDED_IN_REQUEST: NO_FILE_PROVIDED_IN_REQUEST,
  MISSING_DATA_IN_REQUEST: MISSING_DATA_IN_REQUEST,
  SERVICE_NOT_FOUND: SERVICE_NOT_FOUND,
  UNAUTHORIZED_TO_ACCESS_SERVICE: UNAUTHORIZED_TO_ACCESS_SERVICE,
  USER_IS_NOT_ADMIN: USER_IS_NOT_ADMIN,
  UNAUTHORIZED_TO_ADD_FILES: UNAUTHORIZED_TO_ADD_FILES,
  FAILED_TO_MOVE_FILE_FROM_TMP: FAILED_TO_MOVE_FILE_FROM_TMP,
  FAILED_TO_DELETE_FILE_FROM_TMP: FAILED_TO_DELETE_FILE_FROM_TMP,
  FILE_ALREADY_EXISTS: FILE_ALREADY_EXISTS,
  FILE_SYSTEM_ERROR: FILE_SYSTEM_ERROR,
  OLD_FILE_NOT_DELETED_FROM_DISK: OLD_FILE_NOT_DELETED_FROM_DISK,
  OLD_FILE_NOT_DELETED_FROM_DATABASE: OLD_FILE_NOT_DELETED_FROM_DATABASE,

  FILE_DELETED_FROM_DISK: FILE_DELETED_FROM_DISK,
  FILE_DELETED_FROM_DATABASE: FILE_DELETED_FROM_DATABASE,
  AUTHORIZED_TO_DELETE_FILES: AUTHORIZED_TO_DELETE_FILES,
  FILE_FOUND_IN_THE_DATABASE: FILE_FOUND_IN_THE_DATABASE,
  FILE_DELETED: FILE_DELETED,
  USER_IS_ADMIN: USER_IS_ADMIN,
  FILE_ADDED_ON_DISK: FILE_ADDED_ON_DISK,
  AUTHORIZED_TO_ADD_FILES: AUTHORIZED_TO_ADD_FILES
}