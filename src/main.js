var STATUS_PROCESSING = "Processing"
var STATUS_DONE = "Done"

/**
 * Called when the 'Cluster My Inbox' button in the sheet is pressed.
 * This function invokes the clustering process.
 */
function buttonCluster() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var status = sheet.getRange("status")
  var statusMsg = sheet.getRange("statusMsg")

  if (status.getValue() == STATUS_PROCESSING) {
    Browser.msgBox('Clustering is already underway. Please wait for it to complete.');
    return
  }

  status.setValue(STATUS_PROCESSING)
  statusMsg.setValue("Processing emails...")

  var params = getParams(sheet);
  main(params)

  status.setValue(STATUS_DONE)
  statusMsg.setValue("Clustering Done! Please check your Inbox.")
}


/**
 * Called when the 'Reset' button in the sheet is clicked
 * This function resets the status cells
 */
function buttonReset() {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange("status").setValue("")
  sheet.getRange("statusMsg").setValue("")
}

/**
 * The main function. It does the following:
 *  - Fetches the emails from Gmail
 *  - Creates frequency vectors from the email messages.
 *  - Runs k-means++ clustering on the freq. vector collection
 * @param {*} params - no of emails, no of cluster, bm25k
 */
function main(params) {
  // Get email messages and convert them into frequency vectors
  var threads = GmailApp.getInboxThreads(0, params.emailCount)
  var messages = getMessages(threads)
  var msgVectors = getMsgVectors(messages, params.bm25k)

  // Try n times and select the best
  var minSumDist = Infinity
  var minKMeansOutput = {}
  var totalRounds = 3
  for (var i = 0; i < totalRounds; i++) {
    var kmeansOutput = kmeans(msgVectors, params.clusterCount)
    Logger.log("Cluster Sum of Distance (i,sum): %s,%s", i, kmeansOutput.sumOfDistance)
    if (kmeansOutput.sumOfDistance < minSumDist) {
      minSumDist = kmeansOutput.sumOfDistance
      minKMeansOutput = kmeansOutput
    }
  }

  // Adding user defined labels
  Logger.log("Selected (i,sum): %s", minSumDist)
  addClusterLabels(threads, minKMeansOutput.clusters, params.clusterCount)
}

/**
 * Adds new cluster labels to Gmail
 * @param threads - array of email threads
 * @param clusterAssignments - cluster assigned to each email thread
 * @param k - no. of clusters
 */
function addClusterLabels(threads, clusterAssignments, k) {
  var CLUSTERBOX = "ClusterBox"

  // Delete existing ClusterBox labels
  var cbRegex = /^ClusterBox.*/i
  var userLabels = GmailApp.getUserLabels()
  for (var i in userLabels) {
    var name = userLabels[i].getName()
    if (cbRegex.test(name)) {
      userLabels[i].deleteLabel()
    }
  }

  // Create new labels
  GmailApp.createLabel(CLUSTERBOX)

  var labels = []
  for (var ci = 1; ci < k + 1; ci++) {
    labels.push(GmailApp.createLabel(CLUSTERBOX + "/Cluster-" + ci))
  }

  // Apply cluster labels to threads
  for (var t in threads) {
    threads[t].addLabel(labels[clusterAssignments[t]])
  }
}

/**
 * Gets the parameters from the sheet
 */
function getParams(sheet) {
  var nEmails = sheet.getRange("noOfEmails").getValue();
  var nClusters = sheet.getRange("noOfClusters").getValue();

  var params = {
    "emailCount": nEmails,   // Number of emails to get from the inbox
    "clusterCount": nClusters, // Number of clusters to create (for K-means)
    "bm25k": 20    // The k parameter of the BM25 TF transform function
  }

  return params;
}
