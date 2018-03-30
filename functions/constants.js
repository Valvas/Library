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
const UNAUTHORIZED_TO_DOWNLOAD_FILES                                              = 10020;
const FOLDER_NOT_FOUND                                                            = 10021;
const IS_NOT_A_DIRECTORY                                                          = 10022;
const UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET                                 = 10023;
const FOLDER_ALREADY_EXISTS                                                       = 10024;
const AUTHENTICATION_REQUIRED                                                     = 10025;
const REPORT_NOT_FOUND                                                            = 10026;
const UNAUTHORIZED_TO_ACCESS_THIS_FILE                                            = 10027;
const COULD_NOT_CREATE_FOLDER                                                     = 10028;
const UNAUTHORIZED_FILE                                                           = 10029;
const ENCRYPTION_FAILED                                                           = 10030;
const ACCOUNT_NOT_ACTIVATED                                                       = 10031;
const ACCOUNT_SUSPENDED                                                           = 10032;
const COMMENT_NOT_FOUND                                                           = 10033;
const WRONG_EMAIL_FORMAT                                                          = 10034;
const WRONG_LASTNAME_FORMAT                                                       = 10035;
const WRONG_FIRSTNAME_FORMAT                                                      = 10036;
const ADMIN_STATUS_IS_MISSING                                                     = 10037;
const MAIL_NOT_SENT                                                               = 10038;
const EMAIL_ALREADY_IN_USE                                                        = 10039;
const UNABLE_TO_MODIFY_THIS_VALUE                                                 = 10040;
const ACCOUNT_NOT_UPDATED                                                         = 10041;
const INCORRECT_ADMIN_STATUS                                                      = 10042;
const COMMENT_STATUS_INCORRECT                                                    = 10043;
const COMMENT_STATUS_NOT_UPDATED                                                  = 10044;
const REPORT_STATUS_INCORRECT                                                     = 10045;
const REPORT_STATUS_NOT_UPDATED                                                   = 10046;
const INCORRECT_SUSPENSION_STATUS                                                 = 10047;
const UNAUTHORIZED_TO_POST_COMMENTS                                               = 10048;
const LOG_NOT_FOUND                                                               = 10049;
const PORT_OUT_OF_RANGE                                                           = 10050;
const UNABLE_TO_CONNECT_TO_DATABASE                                               = 10051;
const TEST_EMAIL_FAILED                                                           = 10052;
const COULD_NOT_READ_CONFIG_FILE                                                  = 10053;
const ACCOUNT_CREATED_WITHOUT_SENDING_EMAIL                                       = 10054;
const PASSWORD_RESETED_WITHOUT_SENDING_EMAIL                                      = 10055;
const COULD_NOT_READ_SERVICES_FILE                                                = 10056;
const COULD_NOT_PARSE_INCOMING_FORM                                               = 10057;
const NO_FILE_TO_DOWNLOAD                                                         = 10058;
const FILE_HAS_BEEN_DELETED                                                       = 10059;
const COULD_NOT_CREATE_ARCHIVE                                                    = 10060;
const LOG_TYPE_DOES_NOT_EXIST                                                     = 10061;
const WRONG_SUSPENDED_STATUS_FORMAT                                               = 10062;
const IS_A_DIRECTORY                                                              = 10063;
const RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE                                         = 10064;
const RIGHTS_NOT_FOUND                                                            = 10065;
const UNAUTHORIZED_TO_CREATE_ACCOUNTS                                             = 10066;
const UNAUTHORIZED_TO_MODIFY_ACCOUNTS                                             = 10067;
const UNAUTHORIZED_TO_CREATE_SERVICES                                             = 10068;
const SERVICE_IDENTIFIER_ALREADY_IN_USE                                           = 10069;
const SERVICE_NAME_ALREADY_IN_USE                                                 = 10070;
const SERVICE_FILE_MIN_SIZE_TOO_LOW                                               = 10071;
const SERVICE_FILE_MIN_SIZE_TOO_HIGH                                              = 10072;
const UNAUTHORIZED_TO_MANAGE_USER_RIGHTS                                          = 10073;
const UNAUTHORIZED_TO_REMOVE_ACCOUNTS                                             = 10074;

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
const SUCCESS_COPYING_FILE                                                        = 20009;
const SUCCESS_POSTING_REPORT                                                      = 20010;
const COMMENT_ADDED                                                               = 20011;
const NEW_PASSWORD_SENT                                                           = 20012;
const ACCOUNT_SUCCESSFULLY_CREATED                                                = 20013;
const ACCOUNT_UPDATED_SUCCESSFULLY                                                = 20014;
const COMMENT_STATUS_UPDATED                                                      = 20015;
const REPORT_STATUS_UPDATED                                                       = 20016;
const ACCOUNT_RIGHTS_SUCCESSFULLY_UPDATED                                         = 20017;
const FILE_COMMENT_SUCCESSFULLY_ADDED                                             = 20018;
const SERVICE_SUCCESSFULLY_CREATED                                                = 20019;

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
  UNAUTHORIZED_TO_DOWNLOAD_FILES: UNAUTHORIZED_TO_DOWNLOAD_FILES,
  FOLDER_NOT_FOUND: FOLDER_NOT_FOUND,
  IS_NOT_A_DIRECTORY: IS_NOT_A_DIRECTORY,
  UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET: UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET,
  FOLDER_ALREADY_EXISTS: FOLDER_ALREADY_EXISTS,
  AUTHENTICATION_REQUIRED: AUTHENTICATION_REQUIRED,
  REPORT_NOT_FOUND: REPORT_NOT_FOUND,
  UNAUTHORIZED_TO_ACCESS_THIS_FILE: UNAUTHORIZED_TO_ACCESS_THIS_FILE,
  COULD_NOT_CREATE_FOLDER: COULD_NOT_CREATE_FOLDER,
  UNAUTHORIZED_FILE: UNAUTHORIZED_FILE,
  ENCRYPTION_FAILED: ENCRYPTION_FAILED,
  ACCOUNT_NOT_ACTIVATED: ACCOUNT_NOT_ACTIVATED,
  ACCOUNT_SUSPENDED: ACCOUNT_SUSPENDED,
  COMMENT_NOT_FOUND: COMMENT_NOT_FOUND,
  WRONG_EMAIL_FORMAT: WRONG_EMAIL_FORMAT,
  WRONG_LASTNAME_FORMAT: WRONG_LASTNAME_FORMAT,
  WRONG_FIRSTNAME_FORMAT: WRONG_FIRSTNAME_FORMAT,
  ADMIN_STATUS_IS_MISSING: ADMIN_STATUS_IS_MISSING,
  MAIL_NOT_SENT: MAIL_NOT_SENT,
  EMAIL_ALREADY_IN_USE: EMAIL_ALREADY_IN_USE,
  UNABLE_TO_MODIFY_THIS_VALUE: UNABLE_TO_MODIFY_THIS_VALUE,
  ACCOUNT_NOT_UPDATED: ACCOUNT_NOT_UPDATED,
  INCORRECT_ADMIN_STATUS: INCORRECT_ADMIN_STATUS,
  COMMENT_STATUS_INCORRECT: COMMENT_STATUS_INCORRECT,
  COMMENT_STATUS_NOT_UPDATED: COMMENT_STATUS_NOT_UPDATED,
  REPORT_STATUS_INCORRECT: REPORT_STATUS_INCORRECT,
  REPORT_STATUS_NOT_UPDATED: REPORT_STATUS_NOT_UPDATED,
  INCORRECT_SUSPENSION_STATUS: INCORRECT_SUSPENSION_STATUS,
  UNAUTHORIZED_TO_POST_COMMENTS: UNAUTHORIZED_TO_POST_COMMENTS,
  LOG_NOT_FOUND: LOG_NOT_FOUND,
  PORT_OUT_OF_RANGE: PORT_OUT_OF_RANGE,
  UNABLE_TO_CONNECT_TO_DATABASE: UNABLE_TO_CONNECT_TO_DATABASE,
  TEST_EMAIL_FAILED: TEST_EMAIL_FAILED,
  COULD_NOT_READ_CONFIG_FILE: COULD_NOT_READ_CONFIG_FILE,
  ACCOUNT_CREATED_WITHOUT_SENDING_EMAIL: ACCOUNT_CREATED_WITHOUT_SENDING_EMAIL,
  PASSWORD_RESETED_WITHOUT_SENDING_EMAIL: PASSWORD_RESETED_WITHOUT_SENDING_EMAIL,
  COULD_NOT_READ_SERVICES_FILE: COULD_NOT_READ_SERVICES_FILE,
  COULD_NOT_PARSE_INCOMING_FORM: COULD_NOT_PARSE_INCOMING_FORM,
  NO_FILE_TO_DOWNLOAD: NO_FILE_TO_DOWNLOAD,
  FILE_HAS_BEEN_DELETED: FILE_HAS_BEEN_DELETED,
  COULD_NOT_CREATE_ARCHIVE: COULD_NOT_CREATE_ARCHIVE,
  LOG_TYPE_DOES_NOT_EXIST: LOG_TYPE_DOES_NOT_EXIST,
  WRONG_SUSPENDED_STATUS_FORMAT: WRONG_SUSPENDED_STATUS_FORMAT,
  IS_A_DIRECTORY: IS_A_DIRECTORY,
  RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE: RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE,
  RIGHTS_NOT_FOUND: RIGHTS_NOT_FOUND,
  UNAUTHORIZED_TO_CREATE_ACCOUNTS: UNAUTHORIZED_TO_CREATE_ACCOUNTS,
  UNAUTHORIZED_TO_CREATE_SERVICES: UNAUTHORIZED_TO_CREATE_SERVICES,
  SERVICE_IDENTIFIER_ALREADY_IN_USE: SERVICE_IDENTIFIER_ALREADY_IN_USE,
  SERVICE_NAME_ALREADY_IN_USE: SERVICE_NAME_ALREADY_IN_USE,
  SERVICE_FILE_MIN_SIZE_TOO_LOW: SERVICE_FILE_MIN_SIZE_TOO_LOW,
  SERVICE_FILE_MIN_SIZE_TOO_HIGH: SERVICE_FILE_MIN_SIZE_TOO_HIGH,
  UNAUTHORIZED_TO_MANAGE_USER_RIGHTS: UNAUTHORIZED_TO_MANAGE_USER_RIGHTS,
  UNAUTHORIZED_TO_REMOVE_ACCOUNTS: UNAUTHORIZED_TO_REMOVE_ACCOUNTS,

  FILE_DELETED_FROM_DISK: FILE_DELETED_FROM_DISK,
  FILE_DELETED_FROM_DATABASE: FILE_DELETED_FROM_DATABASE,
  AUTHORIZED_TO_DELETE_FILES: AUTHORIZED_TO_DELETE_FILES,
  FILE_FOUND_IN_THE_DATABASE: FILE_FOUND_IN_THE_DATABASE,
  FILE_DELETED: FILE_DELETED,
  USER_IS_ADMIN: USER_IS_ADMIN,
  FILE_ADDED_ON_DISK: FILE_ADDED_ON_DISK,
  AUTHORIZED_TO_ADD_FILES: AUTHORIZED_TO_ADD_FILES,
  SUCCESS_COPYING_FILE: SUCCESS_COPYING_FILE,
  SUCCESS_POSTING_REPORT: SUCCESS_POSTING_REPORT,
  COMMENT_ADDED: COMMENT_ADDED,
  NEW_PASSWORD_SENT: NEW_PASSWORD_SENT,
  ACCOUNT_SUCCESSFULLY_CREATED: ACCOUNT_SUCCESSFULLY_CREATED,
  ACCOUNT_UPDATED_SUCCESSFULLY: ACCOUNT_UPDATED_SUCCESSFULLY,
  COMMENT_STATUS_UPDATED: COMMENT_STATUS_UPDATED,
  REPORT_STATUS_UPDATED: REPORT_STATUS_UPDATED,
  ACCOUNT_RIGHTS_SUCCESSFULLY_UPDATED: ACCOUNT_RIGHTS_SUCCESSFULLY_UPDATED,
  FILE_COMMENT_SUCCESSFULLY_ADDED: FILE_COMMENT_SUCCESSFULLY_ADDED,
  SERVICE_SUCCESSFULLY_CREATED: SERVICE_SUCCESSFULLY_CREATED
}