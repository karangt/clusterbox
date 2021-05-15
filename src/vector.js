/**
 * Creates a frequency vector (map) from a list of terms (words).
 * @param terms - array of terms
 */
function freqVector(terms) {
    var wordList = removeStopWords(terms);

    var freqVect = {}
    wordList.forEach(function (term) {
        if (freqVect.hasOwnProperty(term)) {
            freqVect[term]++;
        } else {
            freqVect[term] = 1;
        }
    });

    return freqVect;
}

/**
 * Does BM25 TF transformation of the frequency vector
 *       (k+1)x
 * y =  -------
 *       x + k
 * @param v - vector to be transformed
 * @param k - the k parameter, as shown in the formula above
 * @returns - transformed vector
 */
function applyBm25Transform(v, k) {
    var newVect = {}
    Object.keys(v).forEach(function (term) {
        var x = v[term];
        newVect[term] = (((k + 1) * x) / (x + k));
    });
    return newVect;
}

/**
 * Returns IDF weights for each term in the collection.
 * IDF(w) = log2((M+1)/df(w))
 * Where, M is no. of documents in the collection
 *        df(w) is document frequency of term w
 *
 * @param idfMap - document freq. of each term
 * @param noOfDocuments - no. of documents in the collection
 */
function idfWeights(idfMap, noOfDocuments) {
    var newVect = {}
    Object.keys(idfMap).forEach(function (term) {
        newVect[term] = Math.log2((noOfDocuments + 1) / idfMap[term])
    })
    return newVect
}

/**
 * Apply IDF weighting to frequency vector.
 * @param v - vector to be transformed
 * @param idfWeights - IDF weight of each term
 */
function applyIdfWeight(v, idfWeights) {
    var newVect = {}
    Object.keys(v).forEach(function (term) {
        newVect[term] = v[term] * idfWeights[term]
    });
    return newVect;
}


/**
 * Returns a vector divided by n.
 * @param v - vector to be divided
 * @param n - the number the vector should be divided by
 */
function divideVector(v, n) {
    var newVect = {}
    Object.keys(v).forEach(function (term) {
        newVect[term] = v[term] / n
    })
    return newVect
}

/**
 * Returns a vector multiplied by n.
 * @param v - vector to be multiplied
 * @param n - the number the vector should be multiplied by
 */
function multiplyVector(v, n) {
    var newVect = {}
    Object.keys(v).forEach(function (term) {
        newVect[term] = v[term] * n
    })
    return newVect
}

/**
 * Returns the sum of vectors passed as arguments.
 */
function addVectors() {
    var newVect = {}

    for (var i = 0; i < arguments.length; i++) {
        var v = arguments[i] // v -> each vector to be added
        Object.keys(v).forEach(function (term) {
            if (newVect.hasOwnProperty(term)) {
                newVect[term] += v[term];
            } else {
                newVect[term] = v[term];
            }
        })
    }
    return newVect
}

/**
 * Returns a single value to determine the distance between two frequency vectors.
 * dist = inverse of similarity (dot product)
 * @param v1 - vector 1
 * @param v2 - vector 2
 */
function vectorDist(v1, v2) {
    var dotProduct = 0.0001
    // We will compute a dot product of the two vectors.
    // For a dot product, it is enough to loop over any
    // one of the vectors as we are just interested in
    // elements that are intersecting.
    Object.keys(v1).forEach(function (term) {
        if (v2.hasOwnProperty(term)) {
            dotProduct += v1[term] * v2[term]
        }
    });

    return 1000 / dotProduct;
}

/**
 * Calculates log to the base 2
 */
Math.log2 = function (x) {
    return Math.log(x) * Math.LOG2E
}