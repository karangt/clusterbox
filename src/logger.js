/**
 * Logs an array to the Apps Script console
 * @param a - the array to log
 * @param subject - the subject to prepend to the log
 */
function logArray(a, subject) {
  Logger.log("-----" + subject + "------")
  a.forEach(function (e) {
    Logger.log(e);
  })
  Logger.log("-------*------")
  Logger.log(" ")
}
