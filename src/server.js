const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// API to generate sample data
app.get('/api/sample-data', (req, res) => {
  const { size = 100, bias = 0.5, noise = 0.3 } = req.query;
  
  // Generate sample data for logistic regression visualization
  const data = generateSampleData(parseInt(size), parseFloat(bias), parseFloat(noise));
  res.json(data);
});

// Generate sample data with two classes for logistic regression
function generateSampleData(size = 100, bias = 0.5, noise = 0.3) {
  const data = [];
  for (let i = 0; i < size; i++) {
    // Generate x1 and x2 features
    const x1 = Math.random() * 10 - 5;
    const x2 = Math.random() * 10 - 5;
    
    // Calculate probability based on a simple linear equation
    const z = bias + x1 * 0.8 + x2 * 1.2;
    let probability = 1 / (1 + Math.exp(-z));
    
    // Add some noise to make it more realistic
    probability += (Math.random() - 0.5) * noise;
    
    // Assign class based on probability
    const cls = probability >= 0.5 ? 1 : 0;
    
    data.push({
      x1,
      x2,
      class: cls,
      probability: Math.min(Math.max(probability, 0), 1) // Ensure probability is between 0 and 1
    });
  }
  
  return data;
}

app.listen(port, () => {
  console.log(`Logistic Regression Demo running at http://localhost:${port}`);
});