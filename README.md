# ALU Forex Exchange - Currency Converter

My project for the ALU "Playing Around with APIs" assignment. It's a forex exchange application that converts currencies using real-time exchange rates.

## What it does

This web application lets you:
- Convert between different currencies with live exchange rates
- View conversion history with search and filter options
- Use on both mobile and desktop devices
- See real-time updates as you type

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js with Express
- **API**: ExchangeRate-API for live currency data
- **Deployment**: GitHub Pages (frontend) + Render.com (backend)
- **Containerization**: Docker support

## Live Demo

- Frontend: https://davy-00.github.io/alu_forex_exchange/
- Backend API: https://alu-forex-exchange.onrender.com

## How to Run Locally

### Option 1: Direct Node.js

1. Clone this repo
```bash
git clone https://github.com/Davy-00/alu_forex_exchange.git
cd alu_forex_exchange
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

4. Open http://localhost:8080

### Option 2: Using Docker

1. Build the Docker image
```bash
docker build -t forex-app .
```

2. Run the container
```bash
docker run -p 8080:8080 forex-app
```

3. Open http://localhost:8080

## Features

- **Real-time currency conversion** with live exchange rates
- **Support for 10+ major currencies** (USD, EUR, GBP, JPY, etc.)
- **Responsive design** works on mobile and desktop
- **Auto-conversion** as you type for instant results
- **Currency swap button** for quick reversal
- **Comprehensive error handling** with user feedback
- **Conversion history** with local storage persistence
- **Search and filter** through conversion history
- **Sort functionality** by date, amount, or currency
- **Load balancer** configuration with automatic failover
- **Multiple backend support** for high availability

## Assignment Requirements Met

✅ **API Integration** - Uses ExchangeRate-API for live data  
✅ **Frontend Development** - HTML/CSS/JavaScript interface  
✅ **Backend Development** - Node.js API server  
✅ **Deployment** - Live on GitHub Pages and Render  
✅ **Documentation** - This README and code comments  
✅ **Error Handling** - Validation and fallback systems  
✅ **Containerization** - Docker support for easy deployment  
✅ **User Interaction** - Search, filter, sort conversion history  
✅ **Load Balancing** - Multiple backend configuration with failover  
✅ **Data Persistence** - Local storage for conversion history  

## About This Project

This demonstrates my understanding of:

- Working with REST APIs and handling responses
- Full-stack web development (frontend + backend)
- Cloud deployment and containerization
- Responsive web design principles
- Error handling and user experience

Created for ALU Software Engineering program as part of the API integration assignment.
