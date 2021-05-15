/**
 * Runs K-Means++ clustering on the given collection of frequency vectors.
 *
 * High level algorithm:
 *   1: Randomly select k elements as centroids OR
 *      Select centroids as defined by the k-means++ algorithm.
 *   2: Assign each element to it's nearest centroid.
 *   3: Recompute the centroid based on the current set of elements.
 *   4: Check if centroid has changed significantly. If not, repeat #2 and #3.
 *
 * @param collection - an array of frequency vectors
 * @param k - number of clusters to create
 * @returns - collection with cluster number assigned to each element
 */
function kmeans(collection, k) {
    // Initialise the cluster assignment array
    var assignedCluster = []
    for (var i in collection) {
        assignedCluster[i] = -1 // no cluster is assigned initially
    }

    //**** 1: Randomly select k elements as centroids ****
    // Method 1: totally random selection of centroids
    //var elementIndexes = kRandomInt(collection.length, k)
    //var centroids = elementIndexes.map(function (e) { return collection[e] })

    // Method 2: selecting centroids as per the k-means++ algorithm
    var centroids = kInitialCentroids(collection, k)


    var iterations = 0
    var maxIterations = 5
    while (true) {
        //**** 2: Assign each element to it's nearest centroid ****
        for (var i in collection) {
            assignedCluster[i] = nearestCentroid(collection[i], centroids)
        }

        //**** 3: Recompute the centroids based on the current set of elements ****
        var newCentroids = computeCentroids(collection, assignedCluster, k)

        //**** 4: Check if centroid has changed significantly. If not, repeat #2 and #3
        var diff = diffCentroids(centroids, newCentroids)
        //Logger.log("Diff:%s", diff)
        if (diff < 0.01 || iterations > maxIterations) {
            break
        }

        iterations++
        centroids = newCentroids
    }

    return {
        clusters: assignedCluster,
        sumOfDistance: sumOfDistance(collection, centroids, assignedCluster)
    }
}


/**
 * Returns sum of distances between each vector and it's centroid.
 * @param collection - an array of frequency vectors
 * @param centroids - an array of cluster centroids
 * @param assignedCluster - an array of cluster assignments
 */
function sumOfDistance(collection, centroids, assignedCluster) {
    var sum = 0
    for (var i in collection) {
        var c = assignedCluster[i] // current cluster
        var cent = centroids[c]  // centroid of current cluster
        sum += vectorDist(cent, collection[i])
    }
    return sum
}

/**
 * Find the difference between the new centroids and the old ones.
 * Returns the average distance between the new and the old centroids.
 * @param newCentroids - New array of centroids
 * @param oldCentroids - Old array of centroids
 */
function diffCentroids(newCentroids, oldCentroids) {
    var diff = 0
    var k = newCentroids.length
    for (var i in newCentroids) {
        diff += vectorDist(newCentroids[i], oldCentroids[i])
    }
    return diff / k
}

/**
 * Compute the new centroids from the collection.
 * @param collection - collection of freqency vectors
 * @param assignedCluster - array indicating which element in
 *                          the collection is assigned to which cluster
 * @param k - No. of clusters
 */
function computeCentroids(collection, assignedCluster, k) {
    // Initialise new centroids
    var centroids = []
    var clusterCount = []
    for (var i = 0; i < k; i++) {
        centroids.push({})
        clusterCount[i] = 0
    }

    // Go through each element to aggregate the sum of vectors for each cluster
    for (var i in collection) {
        var c = assignedCluster[i]
        centroids[c] = addVectors(centroids[c], collection[i])
        clusterCount[c]++
    }

    // Divide the aggregate sum with the number of elements in each cluster
    for (var i = 0; i < k; i++) {
        centroids[i] = divideVector(centroids[i], clusterCount[i])
    }

    return centroids
}

/**
 * Returns the cluster index of the centriod nearest to the element.
 * @param element - frequency vector
 * @param centroids - an array of centroids
 */
function nearestCentroid(element, centroids) {
    var minCentIndex = 0   // Index of the nearest centroid
    var minDist = vectorDist(centroids[minCentIndex], element)   // Distance from nearest centroid

    for (var i = 1; i < centroids.length; i++) {
        var dist = vectorDist(centroids[i], element)
        if (dist < minDist) {
            minDist = dist
            minCentIndex = i
        }
    }

    return minCentIndex
}

/**
 * Returns k random integers.
 * @param upperBound - the max value of the integers
 * @param k - number of integers to generate
 */
function kRandomInt(upperBound, k) {
    var randInt = [];
    for (var i = 0; i < k; i++) {
        randInt.push(randomInt(upperBound));
    }
    return randInt;
}

/**
 * Returns a random integer between 0 and upperBound
 * @param upperBound - the max value of the integer
 */
function randomInt(upperBound) {
    return Math.floor(Math.random() * Math.floor(upperBound));
}

/**
 * Returns initial centroids for k-means clustering.
 * This algorithm is based on the initialisation specified
 * by the k-means++ algorithm (https://en.wikipedia.org/wiki/K-means%2B%2B)
 * @param collection - an array of frequency vectors
 * @param k - number of clusters/centroids
 */
function kInitialCentroids(collection, k) {
    var centroids = []
    // Select first centroid as a random element
    var firstIndex = randomInt(collection.length)
    centroids.push(collection[firstIndex])

    // Remove the selected centroid from collection
    var fCollection = collection.filter(function (v, i) {
        return i != firstIndex
    })

    // Select the remaining (k-1) centroids
    for (var i = 1; i < k; i++) {
        // Calculate the distance for each element from the nearest centroid
        var dist = []
        for (var j in fCollection) {
            var nearestCentIdx = nearestCentroid(fCollection[j], centroids)
            dist.push(vectorDist(centroids[nearestCentIdx], fCollection[j])) //Ideally should be ^2
        }
        // Randomly pick a centroid based on the probability distribution
        var newCentroidIdx = getRandomItem(fCollection, dist)
        centroids.push(fCollection[newCentroidIdx])
        // Remove selected centroid from the collection
        fCollection = fCollection.filter(function (val, idx) {
            return idx != newCentroidIdx
        })
    }

    return centroids
}

/**
 * Gets a random item from a list based on the weight.
 * This code is from https://tinyurl.com/qtupgny
 * @param list - the array from which to get the item
 * @param weight - weight of element in the array
 */
function getRandomItem(list, weight) {
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
        return prev + cur;
    });

    var random_num = rand(0, total_weight);
    var weight_sum = 0;

    for (var i = 0; i < list.length; i++) {
        weight_sum += weight[i];
        weight_sum = +weight_sum.toFixed(2);

        if (random_num <= weight_sum) {
            return i;
        }
    }
}

/**
 * Returns a random number between min and max
 */
function rand(min, max) {
    return Math.random() * (max - min) + min;
}