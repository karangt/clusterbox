# ClusterBox 📬
- [ClusterBox 📬](#clusterbox-%f0%9f%93%ac)
  - [Overview](#overview)
  - [Using ClusterBox](#using-clusterbox)
     - [Set-up](#set-up)
     - [Usage](#usage)
  - [Implementation Details](#implementation-details)
     - [High-Level Code Workflows](#high-level-code-workflows)
         - [Workflow 1: User clicks on the 'Cluster My Inbox' button in the sheet](#workflow-1-user-clicks-on-the-cluster-my-inbox-button-in-the-sheet)
         - [Workflow 2: User clicks on the 'Reset' button in the sheet](#workflow-2-user-clicks-on-the-reset-button-in-the-sheet)
     - [Source Files Description](#source-files-description)

## Overview
**[ClusterBox](http://bit.ly/clusterbox)** makes it easier for Gmail users to deal with emails in their inbox. It is especially useful for people who deal with a lot of email on diverse topics.

ClusterBox fetches the emails in the inbox and uses _Text Clustering_ to group (cluster) them such that _similar_ emails are together. Grouping reduces context switching. As a result, the user can process emails with less cognitive effort than would be needed for going through the inbox sequentially.

ClusterBox seamlessly integrates with Gmail, where it automatically creates Gmail Labels for each email group discovered in the Inbox. As such, no separate user interface is needed to interact with the email groups.

**But Gmail already allows you to group emails. What's new here?**  
Yes, Gmail does allow you to group inbox email into the following categories: _Primary, Social, Promotions, Updates & Forums_. These groupings are useful but they are predefined and not granular. In some cases these groups may not even be relevant to a particular user. For example, these groups may not be very useful in the work environment. ClusterBox improves on this by creating email groups dynamically, adapting to each unique collection of emails. Additionally, it allows the user to create an arbitrary number of email groups. Most people are in fact dealing with more than four _types_ of emails.

## Using ClusterBox
Once set up, using ClusterBox is straightforward.

### Set-up
1. Make sure you are logged into your Google account.
2. Go to the [ClusterBox Google Sheet document.](http://bit.ly/clusterbox)
3. Make a copy of the sheet in your Google Drive by going to _File > Make a copy_. This will also copy the ClusterBox source code.
4. Click on the 'Reset' button to reset the status fields.
5. The sheet will prompt you to provide authorisation to run the ClusterBox script. Here is how to proceed:
   * In the dialog box, click on 'Continue'.
   * In the pop-up that shows up, select the Google account that you want to authorise.
   * Google may warn you to not use this app. We need to ignore that. Click on 'Advanced' link at the bottom and then click on 'Go to ClusterBox (unsafe)'.
   * On the next screen, which says 'ClusterBox wants to access your Google Account' click on 'Allow'.

### Usage
1. In the sheet, set the number of emails you want to process and the number of email clusters/groups you want to create.
2. Click on the 'Cluster My Inbox' to start the processing. The 'Status' field will change to 'Processing'.
3. Once the processing is complete the 'Status' field change to 'Done'.
4. You can now go to your Gmail inbox and look for a new label called 'ClusterBox'. Underneath that label, you will see sub-labels for each of the clusters (format: `Cluster-<N>`). Click on the label to see the emails in that cluster/group.

To re-cluster, just click on the 'Cluster My Inbox' button again.

## Implementation Details

ClusterBox uses _Similarity-Based Text Clustering_ to dynamically group similar emails together. It uses the vector space model to represent the email messages. TF-IDF weighting is applied to the frequency vectors for better performance. Additionally, terms coming from the 'To', 'From', 'CC' and 'Body' fields of the email messages are given different weights.
For clustering, it uses the [K-Means++](https://en.wikipedia.org/wiki/K-means%2B%2B) algorithm, with dot-product as the similarity measure. Clustering performance was evaluated _indirectly_ by manually looking at emails in various clusters.

ClusterBox is implemented as a [Google Apps Script](https://developers.google.com/apps-script) project contained inside a Google Sheet. The user interface is provided through the Google Sheet document itself. You can check out the interface [here](http://bit.ly/clusterbox). The tool is written in Javascript and has no external dependencies. The K-Means++ clustering algorithm has been implemented from scratch.

The source code is available under the [`clusterbox/src`](https://lab.textdata.org/karang3/Course_Project/tree/master/clusterbox/src) directory. Alternatively, follow these steps to view the source code in the Google Apps Script Editor:

1. Make sure you are logged into your Google account.
2. Go to the [ClusterBox Google Sheet document.](http://bit.ly/clusterbox)
3. Make a copy of the document by going to _File > Make a copy_.
4. In the copy, go to _Tools > Script editor_ to view the source code (you can edit the code directly in the editor if you want).

### High-Level Code Workflows
This section will walk you through the code for two different scenarios. To keep the description concise, only the top-level functions are mentioned here.

#### Workflow 1: User clicks on the 'Cluster My Inbox' button in the sheet
1. Function `main.js/buttonCluster()` is triggered.
2. `buttonCluster()` does the following:
   * Sets the 'Status' field in the sheet
   * Gets various parameters from the sheet (no. of emails and no of clusters).
   * Invokes the `main()` function.
3. `main()` does the following:
   * Fetches the email messages from the inbox
   * Invokes `messages.js/getMsgVectors()` to convert messages into a collection of frequency vectors. This step involves the following:
     * Removal of stopwords
     * TF transformation using the BM25 formula: `(x(k+1))/(x+k)`
     * IDF weighting using this formula: `log((M+1)/df(w))`
   * Invokes `clustering.js/kmeans()` (K-Means++ clustering algorithm) N number of times on the collection.
   * Invokes `addClusterLabels()` with the _best_ clustering assignment.
4. `addClusterLabels()` does the following:
   * Removes all existing 'ClusterBox' Gmail Labels
   * Adds new 'ClusterBox' Labels, based on the number of clusters requested by the user.
   * Assigns each email thread in the collection to a cluster Label, as selected by the clustering algorithm.
5. Execution returns to `buttonCluster()`. It sets the 'Status' field to 'Done' in the sheet.

#### Workflow 2: User clicks on the 'Reset' button in the sheet
1. Function `main.js/buttonReset()` is triggered.
2. `buttonReset()` sets the 'Status' field to empty.

### Source Files Description
This section provides a high-level description of the contents of each source file. Individual functions are documented in the source code itself.

**`main.js`**  
This is the entry point. Clicking the 'Reset' or the 'Cluster My Inbox' button in the sheet triggers corresponding functions in this file. Functions in this file are also responsible for fetching the parameters from the sheet.

**`messages.js`**  
This file has code for fetching the email messages using the Gmail APIs and for converting messages into frequency vectors.

**`clustering.js`**  
This file contains the implementation of the K-Means++ algorithm.

**`stopwords.js`**  
Contains functions to remove [stopwords](https://en.wikipedia.org/wiki/Stop_words) from the frequency vectors.

**`vector.js`**  
Contains functions for vector operations.

**`logger.js`**  
Contains helper function for logging.

**`appsscript.json`**  
Captures dependencies for the current Google App Script project.

**`.clasp.json`**  
Stores the 'script ID', which connects these source code files to a specific Apps Script project. This allows commands like `clasp pull` and `clasp push` to work. `clasp` is a CLI tool for Google Apps Script. More information about it can be found [here](https://developers.google.com/apps-script/guides/clasp).

**Note**: `.js` files appear as `.gs` in the Google Apps Script Editor.