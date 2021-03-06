enum ErrorCode {
  /**
   * Checker Error
   */
  CHECKER_ERROR = 10001,
  CHECKER_INPUT_INVALID_ERROR,
  CHECKER_TIMEOUT_ERROR,
  CHECKER_EMPTYMAIN_ERROR,
  CHECKER_TARBALL_NOTFOUND_ERROR,
  CHECKER_MAINFILE_NOTFOUND_ERROR,

  /**
   * Registry Error
   */
  REGISTRY_ERROR = 20001,
}

export default ErrorCode;
