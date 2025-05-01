/**
 * Guided Tour for Logistic Regression Demo
 * This provides a step-by-step walkthrough for new users
 */

class GuidedTour {
    constructor() {
        this.steps = [
            {
                element: '.explanation-panel',
                title: 'Welcome to Logistic Regression',
                content: 'This interactive demo will help you understand how logistic regression works. Let\'s start with the basics.',
                position: 'right'
            },
            {
                element: '#sigmoid-plot',
                title: 'The Sigmoid Function',
                content: 'This is the sigmoid function that transforms any linear value into a probability between 0 and 1. Values above 0.5 are classified as Class 1, below as Class 0.',
                position: 'top'
            },
            {
                element: '#decision-boundary-plot',
                title: 'Decision Boundary',
                content: 'This visualization shows data points from two classes and the decision boundary that separates them. The colors indicate the probability of belonging to Class 1.',
                position: 'left'
            },
            {
                element: '.controls',
                title: 'Interactive Controls',
                content: 'Adjust these sliders to change the weights of the logistic regression model and see how they affect the decision boundary.',
                position: 'right'
            },
            {
                element: '#weight0',
                title: 'Bias Term (w₀)',
                content: 'This is the intercept term. Increasing it shifts the decision boundary upward, while decreasing it shifts the boundary downward.',
                position: 'bottom'
            },
            {
                element: '#weight1',
                title: 'Weight 1 (w₁)',
                content: 'This coefficient affects how the decision boundary rotates along the first feature axis.',
                position: 'bottom'
            },
            {
                element: '#weight2',
                title: 'Weight 2 (w₂)',
                content: 'This coefficient affects how the decision boundary rotates along the second feature axis.',
                position: 'bottom'
            },
            {
                element: '#regenerate-data',
                title: 'Generate New Data',
                content: 'Click this button to regenerate the dataset with different random points.',
                position: 'bottom'
            },
            {
                element: '.confusion-matrix',
                title: 'Confusion Matrix',
                content: 'This matrix shows how well the model classifies the data. True positives/negatives are correct classifications, while false positives/negatives are errors.',
                position: 'left'
            },
            {
                element: '#metrics-display',
                title: 'Performance Metrics',
                content: 'These metrics show how well the model is performing. Accuracy is the overall correctness, precision is the ratio of true positives to all predicted positives, and recall is the ratio of true positives to all actual positives.',
                position: 'bottom'
            },
            {
                element: '#start-learning',
                title: 'Automatic Learning',
                content: 'Click this button to watch the model automatically learn the optimal weights through gradient descent.',
                position: 'right'
            },
            {
                element: '.learning-section',
                title: 'Learning Process',
                content: 'Logistic regression finds the optimal weights by adjusting them to minimize classification error. This section explains the step-by-step process.',
                position: 'top'
            },
            {
                element: 'body',
                title: 'Start Exploring!',
                content: 'You\'re now ready to explore logistic regression on your own. Adjust the weights, regenerate data, and watch how the model learns!',
                position: 'center'
            }
        ];
        
        this.currentStep = 0;
        this.tourActive = false;
        this.overlay = null;
        this.tooltip = null;
    }
    
    /**
     * Start the guided tour
     */
    start() {
        this.tourActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.createTooltip();
        this.showStep(this.currentStep);
        
        // Add tour controls to DOM
        document.body.appendChild(this.createTourControls());
    }
    
    /**
     * Create the translucent overlay
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        document.body.appendChild(this.overlay);
    }
    
    /**
     * Create the tooltip element
     */
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tour-tooltip';
        document.body.appendChild(this.tooltip);
    }
    
    /**
     * Create tour navigation controls
     */
    createTourControls() {
        const controls = document.createElement('div');
        controls.className = 'tour-controls';
        
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.className = 'tour-prev-btn';
        prevButton.addEventListener('click', () => this.previousStep());
        
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.className = 'tour-next-btn';
        nextButton.addEventListener('click', () => this.nextStep());
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close Tour';
        closeButton.className = 'tour-close-btn';
        closeButton.addEventListener('click', () => this.end());
        
        controls.appendChild(prevButton);
        controls.appendChild(nextButton);
        controls.appendChild(closeButton);
        
        return controls;
    }
    
    /**
     * Show a specific step in the tour
     */
    showStep(index) {
        if (index < 0 || index >= this.steps.length) {
            this.end();
            return;
        }
        
        const step = this.steps[index];
        const element = step.element === 'body' ? document.body : document.querySelector(step.element);
        
        if (!element) {
            console.error(`Element not found: ${step.element}`);
            this.nextStep();
            return;
        }
        
        // Position tooltip near the element
        this.positionTooltip(element, step.position);
        
        // Update tooltip content
        this.tooltip.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.content}</p>
            <div class="tour-progress">${index + 1} of ${this.steps.length}</div>
        `;
        
        // Highlight the current element
        this.highlightElement(element);
    }
    
    /**
     * Position the tooltip relative to the target element
     */
    positionTooltip(element, position) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = elementRect.top - tooltipRect.height - 10;
                left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
                break;
            case 'bottom':
                top = elementRect.bottom + 10;
                left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
                break;
            case 'left':
                top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
                left = elementRect.left - tooltipRect.width - 10;
                break;
            case 'right':
                top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
                left = elementRect.right + 10;
                break;
            case 'center':
                top = window.innerHeight / 2 - tooltipRect.height / 2;
                left = window.innerWidth / 2 - tooltipRect.width / 2;
                break;
            default:
                top = elementRect.bottom + 10;
                left = elementRect.left;
        }
        
        // Ensure tooltip stays within viewport
        top = Math.max(10, Math.min(window.innerHeight - tooltipRect.height - 10, top));
        left = Math.max(10, Math.min(window.innerWidth - tooltipRect.width - 10, left));
        
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }
    
    /**
     * Highlight a specific element by creating a "hole" in the overlay
     */
    highlightElement(element) {
        if (element === document.body) {
            this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            return;
        }
        
        const rect = element.getBoundingClientRect();
        
        this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.overlay.style.backdropFilter = 'blur(2px)';
        
        // Create a cutout in the overlay to highlight the element
        this.overlay.style.clipPath = `
            polygon(
                0% 0%, 
                0% 100%, 
                100% 100%, 
                100% 0%,
                0% 0%,
                ${rect.left}px ${rect.top}px, 
                ${rect.left}px ${rect.bottom}px, 
                ${rect.right}px ${rect.bottom}px, 
                ${rect.right}px ${rect.top}px,
                ${rect.left}px ${rect.top}px
            )
        `;
    }
    
    /**
     * Move to the next step
     */
    nextStep() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.end();
        } else {
            this.showStep(this.currentStep);
        }
    }
    
    /**
     * Move to the previous step
     */
    previousStep() {
        this.currentStep--;
        if (this.currentStep < 0) {
            this.currentStep = 0;
        }
        this.showStep(this.currentStep);
    }
    
    /**
     * End the tour
     */
    end() {
        this.tourActive = false;
        
        // Remove tour elements
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
        }
        
        if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
        }
        
        // Remove tour controls
        const controls = document.querySelector('.tour-controls');
        if (controls) {
            document.body.removeChild(controls);
        }
    }
}

// Initialize tour on document ready
document.addEventListener('DOMContentLoaded', function() {
    const tour = new GuidedTour();
    
    // Create tour button
    const tourButton = document.createElement('button');
    tourButton.textContent = 'Start Guided Tour';
    tourButton.className = 'tour-button';
    tourButton.addEventListener('click', () => tour.start());
    
    // Add button to header
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(tourButton);
    }
});