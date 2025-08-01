# Forex Exchange App - ALU Assignment

This is my project for the ALU "Playing Around with APIs" assignment. It's a simple currency converter that uses real exchange rates.

## What it does

- Convert between different currencies
- Shows current exchange rates  
- Works on mobile and desktop
- Simple and easy to use interface

## Tech Stack

- HTML, CSS, JavaScript (frontend)
- Node.js + Express (backend API)
- ExchangeRate API for currency data
- Deployed on GitHub Pages + Render

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

## About

This project demonstrates:
- Working with REST APIs
- Full-stack web development
- Cloud deployment
- Responsive web design
- Error handling and validation

Built for ALU Software Engineering program.
