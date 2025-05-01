# Interactive Logistic Regression Demo

An interactive, beginner-friendly visualization to understand the intuition behind logistic regression. This application provides a hands-on way to explore how logistic regression works through dynamic visualizations and interactive controls.

## Features

- **Interactive Decision Boundary**: See how changes to the model weights affect the decision boundary in real-time
- **Data Visualization**: Visualize sample data points from two different classes
- **Sigmoid Function Plot**: Understand how the logistic function transforms linear values into probabilities
- **Model Training Simulation**: Watch the model learn with animated gradient descent
- **Performance Metrics**: See how accuracy, precision, and recall change as you adjust the model
- **Confusion Matrix**: Visualize true/false positives and negatives

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git (for cloning the repository)

### Installation

#### Option 1: Clone from GitHub

1. Clone the repository:
```bash
git clone https://github.com/your-username/interactive-logistic-regression-demo.git
```

2. Navigate to the project directory:
```bash
cd interactive-logistic-regression-demo
```

3. Install dependencies:
```bash
npm install
```

#### Option 2: Download as ZIP

1. Visit the GitHub repository at `https://github.com/your-username/interactive-logistic-regression-demo`
2. Click the "Code" button and select "Download ZIP"
3. Extract the ZIP file to your preferred location
4. Navigate to the extracted directory in your terminal/command prompt
5. Install dependencies:
```bash
npm install
```

### Running the Application

To start the server:

```bash
npm start
```

For development with automatic server restarts:

```bash
npm run dev
```

Then open your browser and visit: `http://localhost:3000`

## How to Use

1. **Explore the Data**: The scatter plot shows data points from two classes. You can regenerate data with different parameters.

2. **Adjust the Weights**: Use the sliders to modify:
   - Bias (w₀): The intercept term
   - Weight 1 (w₁): Coefficient for feature 1
   - Weight 2 (w₂): Coefficient for feature 2

3. **Watch the Decision Boundary**: As you adjust the weights, see how the decision boundary changes in the visualization.

4. **Start Automatic Learning**: Press "Start Automatic Learning" to watch the model train itself using gradient descent.

5. **Check Performance**: Monitor how your changes affect model metrics in real-time.

## Understanding Logistic Regression

Logistic regression is a statistical method used for binary classification problems. The key concepts demonstrated in this visualization:

- **Sigmoid Function**: Transforms a linear combination of features into a probability value between 0 and 1
- **Decision Boundary**: The line (or curve) that separates the two classes
- **Weights**: Parameters that determine the slope and position of the decision boundary
- **Classification**: Points are classified based on which side of the decision boundary they fall on

## Technologies Used

- **Node.js & Express**: Backend server
- **EJS**: Templating engine
- **D3.js & Plotly.js**: Data visualization
- **Math.js**: Mathematical operations

## License

ISC

## Acknowledgments

- Created for educational purposes to make machine learning concepts more accessible
- Inspired by interactive educational tools for data science