/**
 * Gets first message from each thread.
 * That should be good enough to cluster the threads.
 * @param threads - email threads fetched from Gmail
 * @returns - an array of frequency vectors for each message
 */
function getMessages(threads) {
    var msgList = []
    threads.forEach(function (thread) {
        var firstMsg = thread.getMessages()[0];

        msgList.push({
            subject: freqVector(tokenize(firstMsg.getSubject())),
            body: freqVector(tokenize(firstMsg.getPlainBody())),
            to: freqVector(tokenizeAddress(firstMsg.getTo())),
            cc: freqVector(tokenizeAddress(firstMsg.getCc())),
            from: freqVector(tokenizeAddress(firstMsg.getFrom()))
        })

        Logger.log(thread.getFirstMessageSubject());
    });

    return msgList;
}


/**
 * Combines all properties of a message and returns a single vector for each message.
 * Different parts of the email are given different weightage.
 * It also applies TF-IDF weighting to the frequency vector before returning.
 * @param messages - array of email messages
 * @param bm25k - k parameter of the BM25 TF transformation
 */
function getMsgVectors(messages, bm25k) {
    var idfMap = {}
    var msgVects = messages.map(function (msg) {
        // Combine all the vectors into a single vector
        // Different parts of the email are given different weightage.
        var v = addVectors(
            msg.body,
            multiplyVector(msg.subject, 1.8),
            multiplyVector(msg.to, 1.4),
            multiplyVector(msg.cc, 1.1),
            multiplyVector(msg.from, 2)
        )

        // Update IDF map for terms occuring in this vector
        Object.keys(v).forEach(function (term) {
            if (idfMap.hasOwnProperty(term)) {
                idfMap[term]++;
            } else {
                idfMap[term] = 1;
            }
        })

        return v
    })

    // Apply TF-IDF weighting
    var idfW = idfWeights(idfMap, msgVects.length)
    var msgVectsTfIdf = msgVects.map(function (v) {
        // Apply BM25 TF transformation to the combined vector
        v = applyBm25Transform(v, bm25k)
        // Apply IDF weighting to the vector
        v = applyIdfWeight(v, idfW)
        return v
    })

    return msgVectsTfIdf
}

/**
 * Tokenises a string into individual terms.
 * @param str - string to be tokenised
 */
function tokenize(str) {
    return str.toLowerCase().
        replace(/[\r\n\s,'|<>{}%!*$()\/"“”:#;?[\].+@–\-_=&]+/g, " ").
        split(" ");
}

/**
 * Tokenises fields with email addresses (From, To, CC) into individual terms.
 * @param str - string to be tokenised
 */
function tokenizeAddress(str) {
    return str.toLowerCase().
        replace(/[\r\n\s,|<>{}%!*$()\/":#;?[\]]+/g, " ").
        split(" ");
}
