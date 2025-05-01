/**
 * Logistic Regression Implementation
 * This file contains the core implementation of the logistic regression algorithm
 */

class LogisticRegression {
    constructor(learningRate = 0.1, iterations = 100) {
        this.learningRate = learningRate;
        this.iterations = iterations;
        this.weights = null; // Will be initialized during fit
        this.costHistory = [];
    }

    /**
     * Initialize weights with zeros or random values
     * @param {number} numFeatures - Number of features in the dataset
     * @param {boolean} random - Whether to initialize weights randomly
     */
    initializeWeights(numFeatures, random = false) {
        if (random) {
            this.weights = Array(numFeatures + 1).fill().map(() => Math.random() * 2 - 1);
        } else {
            this.weights = Array(numFeatures + 1).fill(0);
        }
        return this.weights;
    }

    /**
     * Sigmoid function (logistic function)
     * Transforms any input to a value between 0 and 1
     * @param {number} z - Linear combination of features and weights
     * @returns {number} - Value between 0 and 1
     */
    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }

    /**
     * Calculate linear combination of features and weights (z = w0 + w1*x1 + w2*x2 + ...)
     * @param {Array} features - Feature values
     * @returns {number} - Linear combination result
     */
    linearCombination(features) {
        let z = this.weights[0]; // Bias term (w0)
        for (let i = 0; i < features.length; i++) {
            z += features[i] * this.weights[i + 1];
        }
        return z;
    }

    /**
     * Predict probability for a single sample
     * @param {Array} features - Feature values for a single sample
     * @returns {number} - Probability between 0 and 1
     */
    predictProbability(features) {
        const z = this.linearCombination(features);
        return this.sigmoid(z);
    }

    /**
     * Predict class for a single sample (0 or 1)
     * @param {Array} features - Feature values for a single sample
     * @returns {number} - Predicted class (0 or 1)
     */
    predict(features) {
        return this.predictProbability(features) >= 0.5 ? 1 : 0;
    }

    /**
     * Calculate cost function (binary cross-entropy)
     * @param {Array} X - Features for all samples
     * @param {Array} y - Target values (0 or 1)
     * @returns {number} - Cost value
     */
    computeCost(X, y) {
        let cost = 0;
        const m = y.length; // Number of samples

        for (let i = 0; i < m; i++) {
            const features = X[i];
            const probability = this.predictProbability(features);
            
            // Binary cross-entropy formula
            cost += -y[i] * Math.log(probability) - (1 - y[i]) * Math.log(1 - probability);
        }

        return cost / m; // Average cost
    }

    /**
     * One step of gradient descent to update weights
     * @param {Array} X - Features for all samples
     * @param {Array} y - Target values (0 or 1)
     */
    gradientDescentStep(X, y) {
        const m = y.length; // Number of samples
        const numFeatures = X[0].length; // Number of features
        
        // Calculate gradient for each weight
        const gradients = Array(this.weights.length).fill(0);
        
        for (let i = 0; i < m; i++) {
            const features = X[i];
            const prediction = this.predictProbability(features);
            const error = prediction - y[i];
            
            // Update gradient for bias term (w0)
            gradients[0] += error;
            
            // Update gradients for other weights (w1, w2, ...)
            for (let j = 0; j < numFeatures; j++) {
                gradients[j + 1] += error * features[j];
            }
        }
        
        // Update weights using gradients
        for (let j = 0; j < this.weights.length; j++) {
            gradients[j] /= m; // Average gradient
            this.weights[j] -= this.learningRate * gradients[j];
        }
        
        return this.weights;
    }

    /**
     * Main training method
     * @param {Array} X - Features for all samples
     * @param {Array} y - Target values (0 or 1)
     * @param {Function} onIteration - Callback function called after each iteration
     * @returns {Array} - Final weights
     */
    fit(X, y, onIteration = null) {
        if (!X.length || !y.length) {
            throw new Error("Data cannot be empty");
        }
        
        const numFeatures = X[0].length;
        this.initializeWeights(numFeatures);
        this.costHistory = [];
        
        for (let iter = 0; iter < this.iterations; iter++) {
            // Perform one step of gradient descent
            this.gradientDescentStep(X, y);
            
            // Calculate and store cost
            const cost = this.computeCost(X, y);
            this.costHistory.push(cost);
            
            // Call iteration callback if provided
            if (onIteration) {
                onIteration({
                    iteration: iter,
                    weights: [...this.weights], // Clone weights array
                    cost: cost
                });
            }
        }
        
        return this.weights;
    }

    /**
     * Get model performance metrics
     * @param {Array} X - Features for all samples
     * @param {Array} y - Target values (0 or 1)
     * @returns {Object} - Object containing performance metrics
     */
    evaluateModel(X, y) {
        let truePositives = 0;
        let trueNegatives = 0;
        let falsePositives = 0;
        let falseNegatives = 0;
        
        for (let i = 0; i < X.length; i++) {
            const actual = y[i];
            const predicted = this.predict(X[i]);
            
            if (actual === 1 && predicted === 1) {
                truePositives++;
            } else if (actual === 0 && predicted === 0) {
                trueNegatives++;
            } else if (actual === 0 && predicted === 1) {
                falsePositives++;
            } else if (actual === 1 && predicted === 0) {
                falseNegatives++;
            }
        }
        
        const accuracy = (truePositives + trueNegatives) / y.length;
        const precision = truePositives / (truePositives + falsePositives) || 0;
        const recall = truePositives / (truePositives + falseNegatives) || 0;
        const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
        
        return {
            accuracy,
            precision,
            recall,
            f1Score,
            confusionMatrix: [
                [trueNegatives, falsePositives],  // [TN, FP]
                [falseNegatives, truePositives]   // [FN, TP]
            ]
        };
    }
}