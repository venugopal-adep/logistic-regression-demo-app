/**
 * Visualization and Interactive Components for Logistic Regression Demo
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let data = [];
    let model = new LogisticRegression(0.3, 50);
    let learningInterval;
    let isLearning = false;
    let costHistory = [];
    let learningParamsHistory = []; // Store learning parameters history
    let sampleDataPoint = null; // Representative data point for z calculation
    
    // DOM elements
    const weight0Slider = document.getElementById('weight0');
    const weight1Slider = document.getElementById('weight1');
    const weight2Slider = document.getElementById('weight2');
    const weight0Value = document.getElementById('weight0-value');
    const weight1Value = document.getElementById('weight1-value');
    const weight2Value = document.getElementById('weight2-value');
    const dataPointsSlider = document.getElementById('data-points');
    const dataPointsValue = document.getElementById('data-points-value');
    const regenerateButton = document.getElementById('regenerate-data');
    const startLearningButton = document.getElementById('start-learning');
    const stopLearningButton = document.getElementById('stop-learning');
    
    // Initialize weights
    model.weights = [
        parseFloat(weight0Slider.value),
        parseFloat(weight1Slider.value),
        parseFloat(weight2Slider.value)
    ];
    
    // Initialize plots
    initializeSigmoidPlot();
    fetchData();
    initializeGradientDescentPlot();
    
    // Event listeners for sliders
    weight0Slider.addEventListener('input', handleWeightChange);
    weight1Slider.addEventListener('input', handleWeightChange);
    weight2Slider.addEventListener('input', handleWeightChange);
    dataPointsSlider.addEventListener('input', updateDataPointsValue);
    
    // Event listener for regenerate button
    regenerateButton.addEventListener('click', fetchData);
    
    // Event listeners for learning buttons
    startLearningButton.addEventListener('click', startLearning);
    stopLearningButton.addEventListener('click', stopLearning);
    
    /**
     * Update data points value display
     */
    function updateDataPointsValue() {
        dataPointsValue.textContent = dataPointsSlider.value;
    }
    
    /**
     * Handle weight slider changes
     */
    function handleWeightChange() {
        // Update weight values
        const w0 = parseFloat(weight0Slider.value);
        const w1 = parseFloat(weight1Slider.value);
        const w2 = parseFloat(weight2Slider.value);
        
        weight0Value.textContent = w0.toFixed(1);
        weight1Value.textContent = w1.toFixed(1);
        weight2Value.textContent = w2.toFixed(1);
        
        // Update model weights
        model.weights = [w0, w1, w2];
        
        // Update visualizations
        updateDecisionBoundary();
        updatePerformanceMetrics();
        updateSigmoidBoundary(); // Add this line to update sigmoid boundary
    }
    
    /**
     * Fetch sample data from the server
     */
    function fetchData() {
        const size = dataPointsSlider.value;
        
        fetch(`/api/sample-data?size=${size}`)
            .then(response => response.json())
            .then(newData => {
                data = newData;
                
                // Format data for logistic regression
                const X = data.map(d => [d.x1, d.x2]);
                const y = data.map(d => d.class);
                
                // Store a sample data point for z calculation (preferably a class 1 point)
                sampleDataPoint = data.find(d => d.class === 1) || data[0];
                
                // Plot data
                plotDecisionBoundary(X, y);
                
                // Update metrics
                updatePerformanceMetrics();
                
                // Reset cost history and learning params history
                costHistory = [];
                learningParamsHistory = [];
                updateLearningParamsTable();
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    
    /**
     * Initialize the sigmoid function plot
     */
    function initializeSigmoidPlot() {
        // Generate points for sigmoid function
        const xValues = [];
        const yValues = [];
        
        for (let x = -10; x <= 10; x += 0.1) {
            xValues.push(x);
            yValues.push(1 / (1 + Math.exp(-x)));
        }
        
        // Create the sigmoid plot
        const trace = {
            x: xValues,
            y: yValues,
            mode: 'lines',
            line: {
                color: '#4285f4',
                width: 3
            },
            name: 'Sigmoid Function'
        };
        
        const layout = {
            title: 'Sigmoid Function: σ(z) = 1/(1+e^(-z))',
            xaxis: {
                title: 'z = w₀ + w₁x₁ + w₂x₂',
                zeroline: true,
                zerolinecolor: '#999',
                gridcolor: '#eee',
                range: [-10, 10]
            },
            yaxis: {
                title: 'Probability',
                range: [-0.05, 1.05],
                zeroline: true,
                zerolinecolor: '#999',
                gridcolor: '#eee'
            },
            shapes: [
                // Horizontal line at y=0.5 (decision boundary)
                {
                    type: 'line',
                    x0: -10,
                    y0: 0.5,
                    x1: 10,
                    y1: 0.5,
                    line: {
                        color: '#34a853',
                        width: 2,
                        dash: 'dash'
                    }
                },
                // Vertical line at x=0 (initial boundary position)
                {
                    type: 'line',
                    x0: 0,
                    y0: 0,
                    x1: 0,
                    y1: 1,
                    line: {
                        color: '#ea4335',
                        width: 2,
                        dash: 'dash'
                    }
                }
            ],
            annotations: [
                {
                    x: 5,
                    y: 0.5,
                    text: 'Decision Boundary (p=0.5)',
                    showarrow: false,
                    font: {size: 12}
                }
            ],
            margin: {
                l: 50,
                r: 50,
                t: 50,
                b: 50
            }
        };
        
        Plotly.newPlot('sigmoid-plot', [trace], layout, {responsive: true});
    }
    
    /**
     * Plot the decision boundary and data points
     */
    function plotDecisionBoundary(X, y) {
        // Generate points for decision boundary visualization
        const [contourData, boundaryLine] = generateDecisionBoundaryContour();
        
        // Create scatter plot for class 0 points
        const class0 = X.filter((_, i) => y[i] === 0);
        const trace1 = {
            x: class0.map(p => p[0]),
            y: class0.map(p => p[1]),
            mode: 'markers',
            type: 'scatter',
            name: 'Class 0',
            marker: {
                size: 10,
                color: '#4285f4',
                symbol: 'circle'
            }
        };
        
        // Create scatter plot for class 1 points
        const class1 = X.filter((_, i) => y[i] === 1);
        const trace2 = {
            x: class1.map(p => p[0]),
            y: class1.map(p => p[1]),
            mode: 'markers',
            type: 'scatter',
            name: 'Class 1',
            marker: {
                size: 10,
                color: '#ea4335',
                symbol: 'circle'
            }
        };
        
        const layout = {
            title: 'Logistic Regression Decision Boundary',
            xaxis: {
                title: 'Feature 1',
                range: [-6, 6]
            },
            yaxis: {
                title: 'Feature 2',
                range: [-6, 6]
            },
            hovermode: 'closest',
            margin: {
                l: 50,
                r: 50,
                t: 50,
                b: 50
            },
            legend: {
                x: 1,
                y: 1
            }
        };
        
        Plotly.newPlot('decision-boundary-plot', [contourData, boundaryLine, trace1, trace2], layout, {responsive: true});
    }
    
    /**
     * Update the decision boundary based on current weights
     */
    function updateDecisionBoundary() {
        if (data.length === 0) return;
        
        const [contourData, boundaryLine] = generateDecisionBoundaryContour();
        
        // Only update the first two traces (contour and boundary line)
        // while preserving the data points (red and blue points)
        Plotly.update('decision-boundary-plot', {
            // Update the first trace (contour data)
            z: [contourData.z]
        }, {}, [0]);
        
        // Update the second trace (boundary line)
        Plotly.update('decision-boundary-plot', {
            x: [boundaryLine.x],
            y: [boundaryLine.y]
        }, {}, [1]);
    }
    
    /**
     * Generate contour data for decision boundary visualization
     */
    function generateDecisionBoundaryContour() {
        // Generate grid of points
        const x = [];
        const y = [];
        const z = [];
        
        for (let i = -6; i <= 6; i += 0.2) {
            const zRow = [];
            const xRow = [];
            const yRow = [];
            
            for (let j = -6; j <= 6; j += 0.2) {
                // Calculate probability for this point
                const prob = model.predictProbability([i, j]);
                
                xRow.push(i);
                yRow.push(j);
                zRow.push(prob);
            }
            
            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }
        
        // Create contour plot
        const contourData = {
            x: x[0],
            y: y.map(row => row[0]),
            z: z,
            type: 'contour',
            colorscale: [
                [0, '#4285f4'],   // Blue for class 0
                [0.45, '#c2dbff'], // Light blue
                [0.5, '#ffffff'],  // White for decision boundary
                [0.55, '#ffcdd2'], // Light red
                [1, '#ea4335']    // Red for class 1
            ],
            colorbar: {
                title: 'Probability',
                titleside: 'right',
                titlefont: {
                    size: 14,
                    family: 'Arial, sans-serif'
                }
            },
            contours: {
                start: 0,
                end: 1,
                size: 0.1,
                showlines: true,
                coloring: 'heatmap',
                showlabels: false,
                // Make the decision boundary line more visible
                line: {
                    width: 2,
                    color: 'black',
                },
                // Set specific level for the decision boundary
                levels: [0.5]
            },
            hoverinfo: 'x+y+z',
            showscale: true
        };

        // Create a separate line trace for the decision boundary
        // This ensures the boundary is clearly visible
        const boundaryLine = generateDecisionBoundaryLine();
        
        return [contourData, boundaryLine];
    }

    /**
     * Generate a separate line trace for the decision boundary (p=0.5)
     */
    function generateDecisionBoundaryLine() {
        const w0 = model.weights[0];
        const w1 = model.weights[1];
        const w2 = model.weights[2];
        
        // For the line: w0 + w1*x1 + w2*x2 = 0
        // We can solve for x2: x2 = (-w0 - w1*x1) / w2
        
        // Only create the line if w2 is not zero (to avoid division by zero)
        if (Math.abs(w2) < 0.0001) {
            return {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                line: {
                    color: 'green',
                    width: 3
                },
                name: 'Decision Boundary (p=0.5)'
            };
        }
        
        // Create points along the decision boundary
        const x1Values = [];
        const x2Values = [];
        
        for (let x1 = -6; x1 <= 6; x1 += 0.1) {
            const x2 = (-w0 - w1 * x1) / w2;
            
            // Only add points within our plotting range
            if (x2 >= -6 && x2 <= 6) {
                x1Values.push(x1);
                x2Values.push(x2);
            }
        }
        
        return {
            x: x1Values,
            y: x2Values,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'green',
                width: 3,
                dash: 'solid'
            },
            name: 'Decision Boundary (p=0.5)'
        };
    }
    
    /**
     * Update model performance metrics
     */
    function updatePerformanceMetrics() {
        if (data.length === 0) return;
        
        // Format data for evaluation
        const X = data.map(d => [d.x1, d.x2]);
        const y = data.map(d => d.class);
        
        // Calculate metrics
        const metrics = model.evaluateModel(X, y);
        
        // Update metrics display
        document.getElementById('accuracy').textContent = metrics.accuracy.toFixed(2);
        document.getElementById('precision').textContent = metrics.precision.toFixed(2);
        document.getElementById('recall').textContent = metrics.recall.toFixed(2);
        
        // Create confusion matrix visualization
        createConfusionMatrix(metrics.confusionMatrix);
    }
    
    /**
     * Create confusion matrix visualization
     */
    function createConfusionMatrix(matrix) {
        const tn = matrix[0][0];
        const fp = matrix[0][1];
        const fn = matrix[1][0];
        const tp = matrix[1][1];
        
        const data = [{
            type: 'heatmap',
            z: matrix,
            x: ['Predicted 0', 'Predicted 1'],
            y: ['Actual 0', 'Actual 1'],
            colorscale: [
                [0, '#ffffff'],
                [0.5, '#c2e0c6'],
                [1, '#34a853']
            ],
            showscale: false,
            hoverinfo: 'text',
            text: [
                [`True Negative: ${tn}`, `False Positive: ${fp}`],
                [`False Negative: ${fn}`, `True Positive: ${tp}`]
            ]
        }];
        
        const layout = {
            title: 'Confusion Matrix',
            xaxis: {
                title: 'Predicted Class'
            },
            yaxis: {
                title: 'Actual Class'
            },
            annotations: [
                {
                    x: 0,
                    y: 0,
                    text: tn.toString(),
                    // Improve visibility by using black text on white/light cells and white on dark green cells
                    font: {
                        color: getContrastColor(matrix[0][0], Math.max(...matrix.flat())),
                        size: 16, // Make text larger
                        weight: 'bold' // Make text bold
                    },
                    showarrow: false
                },
                {
                    x: 1,
                    y: 0,
                    text: fp.toString(),
                    font: {
                        color: getContrastColor(matrix[0][1], Math.max(...matrix.flat())),
                        size: 16,
                        weight: 'bold'
                    },
                    showarrow: false
                },
                {
                    x: 0,
                    y: 1,
                    text: fn.toString(),
                    font: {
                        color: getContrastColor(matrix[1][0], Math.max(...matrix.flat())),
                        size: 16,
                        weight: 'bold'
                    },
                    showarrow: false
                },
                {
                    x: 1,
                    y: 1,
                    text: tp.toString(),
                    font: {
                        color: getContrastColor(matrix[1][1], Math.max(...matrix.flat())),
                        size: 16,
                        weight: 'bold'
                    },
                    showarrow: false
                }
            ],
            margin: {
                l: 50,
                r: 50,
                t: 50,
                b: 50
            }
        };
        
        Plotly.newPlot('confusion-matrix', data, layout, {staticPlot: true, responsive: true});
    }

    /**
     * Get a high contrast color based on the cell value
     * @param {number} value - The value in the cell
     * @param {number} max - The maximum value in the matrix
     * @returns {string} - A color ('white' or 'black') that contrasts with the cell color
     */
    function getContrastColor(value, max) {
        // If the value is 0, use black text
        if (value === 0) return 'black';
        
        // For other values, calculate the relative intensity
        const intensity = value / max;
        
        // Use white text on darker backgrounds and black text on lighter backgrounds
        return intensity > 0.5 ? 'white' : 'black';
    }
    
    /**
     * Start automatic learning process
     */
    function startLearning() {
        if (isLearning || data.length === 0) return;
        
        isLearning = true;
        startLearningButton.disabled = true;
        stopLearningButton.disabled = false;
        
        // Format data for training
        const X = data.map(d => [d.x1, d.x2]);
        const y = data.map(d => d.class);
        
        // Reset model and initialize weights
        model = new LogisticRegression(0.1, 200);
        model.initializeWeights(2, true);
        
        let iteration = 0;
        const totalIterations = 50;
        
        // Clear cost history and learning params history
        costHistory = [];
        learningParamsHistory = [];
        
        // Update sliders with initial weights
        updateWeightSliders();
        
        learningInterval = setInterval(() => {
            if (iteration >= totalIterations) {
                stopLearning();
                return;
            }
            
            // Get weights before update for gradient calculation
            const currentWeights = [...model.weights];
            
            // Perform gradient descent step
            const gradients = model.gradientDescentStep(X, y);
            
            // Calculate and store cost
            const cost = model.computeCost(X, y);
            costHistory.push({
                iteration: iteration,
                cost: cost
            });
            
            // Calculate z and y_hat for sample data point
            const z = calculateZ(currentWeights, sampleDataPoint);
            const yHat = calculateYHat(z);
            
            // Store learning parameters
            learningParamsHistory.push({
                iteration: iteration,
                w1: currentWeights[1],
                w2: currentWeights[2],
                bias: currentWeights[0],
                z: z,
                yHat: yHat,
                loss: calculateLoss(yHat, sampleDataPoint.class),
                gradientW1: gradients[1],
                gradientW2: gradients[2],
                gradientBias: gradients[0]
            });
            
            // Update UI
            updateWeightSliders();
            updateDecisionBoundary();
            updatePerformanceMetrics();
            updateGradientDescentPlot();
            updateLearningParamsTable();
            
            // Add visual effect to learning points
            addLearningAnimation();
            
            iteration++;
        }, 100); // Update every 100ms
    }
    
    /**
     * Stop automatic learning process
     */
    function stopLearning() {
        if (!isLearning) return;
        
        clearInterval(learningInterval);
        isLearning = false;
        startLearningButton.disabled = false;
        stopLearningButton.disabled = true;
    }
    
    /**
     * Initialize gradient descent visualization
     */
    function initializeGradientDescentPlot() {
        const trace = {
            x: [],
            y: [],
            mode: 'lines+markers',
            name: 'Cost',
            line: {
                color: '#ea4335',
                width: 2
            },
            marker: {
                size: 6,
                color: '#ea4335'
            }
        };
        
        const layout = {
            title: 'Cost vs. Iteration',
            xaxis: {
                title: 'Iteration',
                showgrid: true,
                zeroline: true
            },
            yaxis: {
                title: 'Cost (Binary Cross-Entropy)',
                showgrid: true,
                zeroline: true
            },
            margin: {
                l: 50,
                r: 20,
                t: 30,
                b: 40
            }
        };
        
        Plotly.newPlot('gradient-descent-visual', [trace], layout, {responsive: true});
    }
    
    /**
     * Update the gradient descent plot with new cost values
     */
    function updateGradientDescentPlot() {
        if (costHistory.length === 0) return;
        
        const x = costHistory.map(d => d.iteration);
        const y = costHistory.map(d => d.cost);
        
        const update = {
            x: [x],
            y: [y]
        };
        
        Plotly.update('gradient-descent-visual', update);
        
        // Add animation effect to the latest point
        if (x.length > 0) {
            const latestPoint = {
                x: [x[x.length - 1]],
                y: [y[y.length - 1]],
                marker: {
                    size: 10,
                    color: '#34a853',
                    symbol: 'circle'
                }
            };
            
            Plotly.addTraces('gradient-descent-visual', latestPoint);
            
            // Remove the highlighted point after animation
            setTimeout(() => {
                Plotly.deleteTraces('gradient-descent-visual', 1);
            }, 300);
        }
    }
    
    /**
     * Add learning animation to the decision boundary plot
     */
    function addLearningAnimation() {
        // Create animation for learning points at the decision boundary
        const boundaryPointsX = [];
        const boundaryPointsY = [];
        
        // Find points near the decision boundary
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const probability = model.predictProbability([point.x1, point.x2]);
            
            // Points very close to the decision boundary
            if (Math.abs(probability - 0.5) < 0.1) {
                boundaryPointsX.push(point.x1);
                boundaryPointsY.push(point.x2);
            }
        }
        
        // Add animation points to the plot if there are any boundary points
        if (boundaryPointsX.length > 0) {
            const animationPoints = {
                x: boundaryPointsX,
                y: boundaryPointsY,
                mode: 'markers',
                type: 'scatter',
                marker: {
                    size: 12,
                    color: 'rgba(255, 215, 0, 0.7)',
                    symbol: 'circle',
                    line: {
                        color: 'rgba(255, 215, 0, 1)',
                        width: 2
                    }
                },
                hoverinfo: 'none',
                showlegend: false
            };
            
            // Check if there's already an animation trace (index 4) and remove it
            if (document.querySelector('#decision-boundary-plot').data.length > 4) {
                Plotly.deleteTraces('decision-boundary-plot', 4);
            }
            
            // Add the new animation trace
            Plotly.addTraces('decision-boundary-plot', animationPoints);
            
            // Remove animation points after they fade
            setTimeout(() => {
                // Only remove if it exists (to avoid errors)
                if (document.querySelector('#decision-boundary-plot').data.length > 4) {
                    Plotly.deleteTraces('decision-boundary-plot', 4);
                }
            }, 300);
        }
    }
    
    /**
     * Update weight sliders to match current model weights
     */
    function updateWeightSliders() {
        weight0Slider.value = model.weights[0];
        weight1Slider.value = model.weights[1];
        weight2Slider.value = model.weights[2];
        
        weight0Value.textContent = model.weights[0].toFixed(1);
        weight1Value.textContent = model.weights[1].toFixed(1);
        weight2Value.textContent = model.weights[2].toFixed(1);
        
        // Update the sigmoid plot's decision boundary position
        updateSigmoidBoundary();
    }

    /**
     * Update the sigmoid plot's decision boundary position
     * We're shifting the horizontal line instead of the vertical line
     * to better represent the decision threshold changing
     */
    function updateSigmoidBoundary() {
        // For logistic regression, the decision boundary is typically at 0.5
        // However, we can visualize how different thresholds would affect classification
        // based on the current weights
        
        const w0 = model.weights[0];
        
        // Calculate effective threshold (between 0-1)
        // As bias (w0) increases, the threshold effectively decreases
        // This is because higher bias makes it easier to classify as class 1
        const effectiveThreshold = 0.5 - (w0 * 0.05);
        
        // Clamp the threshold between 0.1 and 0.9 for visualization purposes
        const thresholdClamped = Math.min(0.9, Math.max(0.1, effectiveThreshold));
        
        const update = {
            shapes: [
                // Horizontal line that shifts up/down based on the bias
                {
                    type: 'line',
                    x0: -10,
                    y0: thresholdClamped,
                    x1: 10,
                    y1: thresholdClamped,
                    line: {
                        color: '#34a853',
                        width: 2,
                        dash: 'dash'
                    }
                },
                // Fixed vertical line at x=0
                {
                    type: 'line',
                    x0: 0,
                    y0: 0,
                    x1: 0,
                    y1: 1,
                    line: {
                        color: '#ea4335',
                        width: 2,
                        dash: 'dash'
                    }
                }
            ],
            annotations: [
                {
                    x: -8,
                    y: thresholdClamped,
                    text: `Decision Threshold: ${thresholdClamped.toFixed(2)}`,
                    showarrow: true,
                    arrowhead: 3,
                    ax: 0,
                    ay: -30,
                    font: {size: 12}
                },
                {
                    x: 0,
                    y: 0.85,
                    text: 'z = 0',
                    showarrow: false,
                    font: {size: 10}
                }
            ]
        };
        
        Plotly.relayout('sigmoid-plot', update);
    }

    /**
     * Update learning parameters table with history data
     */
    function updateLearningParamsTable() {
        const tableBody = document.querySelector('#learning-params-table tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        
        // Add rows for each iteration in learning history
        learningParamsHistory.forEach(params => {
            const row = document.createElement('tr');
            
            // Create cells for each parameter
            const iterationCell = document.createElement('td');
            iterationCell.textContent = params.iteration;
            
            const w1Cell = document.createElement('td');
            w1Cell.textContent = params.w1.toFixed(3);
            
            const w2Cell = document.createElement('td');
            w2Cell.textContent = params.w2.toFixed(3);
            
            const biasCell = document.createElement('td');
            biasCell.textContent = params.bias.toFixed(3);
            
            const zCell = document.createElement('td');
            zCell.textContent = params.z.toFixed(3);
            
            const yHatCell = document.createElement('td');
            yHatCell.textContent = params.yHat.toFixed(3);
            
            const lossCell = document.createElement('td');
            lossCell.textContent = params.loss.toFixed(6);
            
            const gradW1Cell = document.createElement('td');
            gradW1Cell.textContent = params.gradientW1.toFixed(3);
            
            const gradW2Cell = document.createElement('td');
            gradW2Cell.textContent = params.gradientW2.toFixed(3);
            
            const gradBiasCell = document.createElement('td');
            gradBiasCell.textContent = params.gradientBias.toFixed(3);
            
            // Append cells to the row
            row.appendChild(iterationCell);
            row.appendChild(w1Cell);
            row.appendChild(w2Cell);
            row.appendChild(biasCell);
            row.appendChild(zCell);
            row.appendChild(yHatCell);
            row.appendChild(lossCell);
            row.appendChild(gradW1Cell);
            row.appendChild(gradW2Cell);
            row.appendChild(gradBiasCell);
            
            // Append row to table body
            tableBody.appendChild(row);
        });
        
        // Scroll to the bottom to show latest row
        const tableContainer = document.querySelector('.table-container');
        tableContainer.scrollTop = tableContainer.scrollHeight;
    }

    /**
     * Calculate z value for a sample data point
     */
    function calculateZ(weights, dataPoint) {
        if (!dataPoint) return 0;
        return weights[0] + weights[1] * dataPoint.x1 + weights[2] * dataPoint.x2;
    }
    
    /**
     * Calculate y_hat (predicted probability) from z
     */
    function calculateYHat(z) {
        return 1 / (1 + Math.exp(-z));
    }
    
    /**
     * Calculate loss for a single example
     */
    function calculateLoss(yHat, actualY) {
        // Prevent log(0) which is -Infinity
        const epsilon = 1e-15;
        yHat = Math.max(Math.min(yHat, 1 - epsilon), epsilon);
        
        // Log loss formula: -[y*log(yHat) + (1-y)*log(1-yHat)]
        return -(actualY * Math.log(yHat) + (1 - actualY) * Math.log(1 - yHat));
    }
    
    /**
     * Calculate gradients for a single example
     */
    function calculateGradients(yHat, actualY, dataPoint) {
        const error = yHat - actualY;
        const gradientW1 = error * dataPoint.x1;
        const gradientW2 = error * dataPoint.x2;
        const gradientBias = error; // The gradient for bias is just the error
        
        return {
            gradientW1,
            gradientW2,
            gradientBias
        };
    }
});