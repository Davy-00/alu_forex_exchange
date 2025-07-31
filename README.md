# ALU Forex Exchange Application

A comprehensive, professional-grade currency exchange application built for the ALU "Playing Around with APIs" assignment. This application provides real-time exchange rates, currency conversion, historical data visualization, and load-balanced deployment capabilities.

## 🌟 Features

### Core Functionality
- **Real-time Exchange Rates**: Live currency exchange rates from reliable APIs
- **Currency Conversion**: Convert between 20+ supported currencies with precision
- **Interactive Dashboard**: Comprehensive overview with quick conversion tools
- **Historical Charts**: Visual representation of currency trends over time
- **Conversion History**: Track and manage recent conversions
- **Search & Filter**: Find currencies quickly with smart search functionality

### Technical Features
- **Load Balanced Architecture**: Runs on multiple servers with HAProxy load balancing
- **Dockerized Deployment**: Containerized for consistent deployment across environments
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Error Handling**: Robust error management with user-friendly feedback
- **Caching**: Intelligent caching for improved performance
- **Rate Limiting**: API protection with configurable rate limits
- **Security**: Helmet.js security headers and input validation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   External APIs │
│    (HAProxy)    │    │ ExchangeRate-API│
└─────────┬───────┘    └─────────────────┘
          │                       ▲
          ▼                       │
┌─────────────────┐              │
│     Web-01      │──────────────┘
│  (Node.js App)  │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│     Web-02      │──────────────┐
│  (Node.js App)  │              │
└─────────────────┘              ▼
                        ┌─────────────────┐
                        │   External APIs │
                        │ ExchangeRate-API│
                        └─────────────────┘
```

## 🚀 Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **node-fetch**: HTTP client for API requests
- **Helmet.js**: Security middleware
- **CORS**: Cross-origin resource sharing
- **node-cache**: In-memory caching
- **rate-limiter-flexible**: Rate limiting

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: ES6+ features
- **Chart.js**: Data visualization
- **Font Awesome**: Icons

### Infrastructure
- **Docker**: Containerization
- **HAProxy**: Load balancing
- **Docker Hub**: Container registry

## 📋 Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 6.0.0 or higher
- **Docker** 20.0.0 or higher (for deployment)
- **Git** for version control

## 🛠️ Local Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd alu_forex_exchange
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment example
cp .env.example .env

# Edit .env file with your settings
nano .env
```

### 4. Start Development Server
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

### 5. Access the Application
Open your browser and navigate to: `http://localhost:8080`

## 🐳 Docker Deployment

### Local Docker Build & Test

1. **Build the Docker Image**
```bash
docker build -t <your-dockerhub-username>/alu-forex-exchange:v1 .
```

2. **Test Locally**
```bash
docker run -p 8080:8080 -e SERVER_NAME=local <your-dockerhub-username>/alu-forex-exchange:v1
```

3. **Verify Application**
```bash
curl http://localhost:8080
curl http://localhost:8080/health
```

### Push to Docker Hub

1. **Login to Docker Hub**
```bash
docker login
```

2. **Push Image**
```bash
docker push <your-dockerhub-username>/alu-forex-exchange:v1
docker tag <your-dockerhub-username>/alu-forex-exchange:v1 <your-dockerhub-username>/alu-forex-exchange:latest
docker push <your-dockerhub-username>/alu-forex-exchange:latest
```

## 🌐 Production Deployment

### Lab Environment Setup

This application is designed to work with the lab infrastructure:
- **Web-01**: Container instance 1
- **Web-02**: Container instance 2  
- **LB-01**: HAProxy load balancer

### Deploy on Web Servers

1. **Deploy on Web-01**
```bash
ssh user@web-01
docker pull <your-dockerhub-username>/alu-forex-exchange:v1
docker stop forex-app 2>/dev/null || true
docker rm forex-app 2>/dev/null || true
docker run -d --name forex-app --restart unless-stopped \
  -p 8080:8080 \
  -e SERVER_NAME=web-01 \
  -e NODE_ENV=production \
  <your-dockerhub-username>/alu-forex-exchange:v1
```

2. **Deploy on Web-02**
```bash
ssh user@web-02
docker pull <your-dockerhub-username>/alu-forex-exchange:v1
docker stop forex-app 2>/dev/null || true
docker rm forex-app 2>/dev/null || true
docker run -d --name forex-app --restart unless-stopped \
  -p 8080:8080 \
  -e SERVER_NAME=web-02 \
  -e NODE_ENV=production \
  <your-dockerhub-username>/alu-forex-exchange:v1
```

3. **Verify Deployment**
```bash
# Test Web-01
curl http://172.20.0.11:8080/health

# Test Web-02  
curl http://172.20.0.12:8080/health
```

### Configure Load Balancer (LB-01)

1. **Update HAProxy Configuration**
```bash
ssh user@lb-01
sudo cp /path/to/haproxy.cfg /etc/haproxy/haproxy.cfg
```

The HAProxy configuration includes:
```haproxy
backend forex_backend
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    
    server web01 172.20.0.11:8080 check inter 5s fall 3 rise 2
    server web02 172.20.0.12:8080 check inter 5s fall 3 rise 2
```

2. **Reload HAProxy**
```bash
# Method 1: Graceful reload
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'

# Method 2: Restart container
docker restart lb-01
```

### Testing Load Balancing

1. **Test Round-Robin Distribution**
```bash
# Multiple requests should alternate between servers
for i in {1..10}; do
  curl -s http://localhost/health | jq '.server'
  sleep 1
done
```

2. **Expected Output**
```
"web-01"
"web-02"
"web-01"  
"web-02"
...
```

3. **Load Test**
```bash
# Using Apache Bench (if available)
ab -n 100 -c 10 http://localhost/

# Or using curl in a loop
for i in {1..50}; do
  curl -s http://localhost/ > /dev/null
  echo "Request $i completed"
done
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment mode | `development` |
| `SERVER_NAME` | Server identifier | `unknown` |
| `RATE_LIMIT_POINTS` | Rate limit requests | `100` |
| `RATE_LIMIT_DURATION` | Rate limit window (seconds) | `60` |
| `CACHE_TTL` | Cache time-to-live (seconds) | `300` |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Main application |
| `GET` | `/health` | Health check |
| `GET` | `/api/currencies` | Supported currencies |
| `GET` | `/api/rates/:base` | Exchange rates |
| `POST` | `/api/convert` | Currency conversion |
| `GET` | `/api/historical/:from/:to` | Historical data |

## 🎯 Features Overview

### 1. Dashboard
- Real-time status indicators
- Quick currency converter
- Popular exchange rates table
- Server and API status monitoring

### 2. Currency Converter
- Support for 20+ major currencies
- Real-time conversion rates
- Conversion history tracking
- Swap currency functionality
- Detailed conversion information

### 3. Live Rates
- Real-time exchange rates grid
- Base currency selection
- Currency search and filtering
- Rate change indicators
- Manual refresh capability

### 4. Charts & Analytics
- Historical rate visualization
- Multiple time periods (7, 30, 90, 365 days)
- Interactive Chart.js graphs
- Statistical analysis (high, low, change)
- Trend analysis

## 📊 API Credits & Data Sources

### Primary Data Provider
- **ExchangeRate-API.com**: Free tier exchange rate API
  - No API key required for basic usage
  - Rate limit: 1500 requests/month (free tier)
  - Real-time exchange rates
  - 160+ supported currencies

### Attribution
This application properly credits all external APIs and follows their terms of service:
- Exchange rates provided by [ExchangeRate-API](https://exchangerate-api.com)
- Icons by [Font Awesome](https://fontawesome.com)
- Charts powered by [Chart.js](https://chartjs.org)

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: API endpoints protected against abuse
- **Security Headers**: Helmet.js provides security headers
- **CORS Protection**: Configured cross-origin resource sharing
- **Error Handling**: Graceful error handling without exposing internals
- **Non-root Container**: Docker container runs as non-privileged user

## 🐛 Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Graceful handling of API failures
- **Invalid Inputs**: User-friendly validation messages
- **Rate Limiting**: Clear feedback when limits are exceeded
- **Server Errors**: Proper error logging and user feedback
- **Fallback Mechanisms**: Alternative data sources when primary fails

## 📈 Performance Optimizations

- **Caching**: In-memory caching of API responses (5-minute TTL)
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Lazy Loading**: Chart data loaded on demand
- **Efficient DOM Updates**: Minimal DOM manipulation
- **Responsive Images**: Optimized assets for different screen sizes
- **Compression**: Gzip compression for static assets

## 🔍 Monitoring & Observability

### Health Checks
- **Endpoint**: `GET /health`
- **Docker Health Check**: Built-in container health monitoring
- **HAProxy Health Checks**: Load balancer monitors backend health

### Logging
- **Request Logging**: All API requests logged
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response times and throughput

### Metrics Available
```json
{
  "status": "healthy",
  "timestamp": "2025-01-31T12:00:00.000Z",
  "uptime": 3600,
  "server": "web-01"
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Functionality Testing
- [ ] Currency conversion works correctly
- [ ] Exchange rates update properly
- [ ] History tracking functions
- [ ] Charts display correctly
- [ ] Search and filtering work
- [ ] Error messages are appropriate

#### Load Balancing Testing
- [ ] Requests alternate between servers
- [ ] Health checks return correct server names
- [ ] Failover works when one server is down
- [ ] Sessions persist across requests

#### Mobile Responsiveness
- [ ] Application works on mobile devices
- [ ] Navigation is accessible
- [ ] Forms are usable on touch screens
- [ ] Charts display properly on small screens

### API Testing
```bash
# Test currency list
curl http://localhost:8080/api/currencies

# Test exchange rates
curl http://localhost:8080/api/rates/USD

# Test conversion
curl -X POST http://localhost:8080/api/convert \
  -H "Content-Type: application/json" \
  -d '{"from":"USD","to":"EUR","amount":100}'

# Test historical data
curl http://localhost:8080/api/historical/USD/EUR?days=30
```

## 🚀 Future Enhancements

### Planned Features
- **User Authentication**: Personal dashboards and saved preferences
- **Advanced Charts**: Multiple timeframes and technical indicators
- **Email Alerts**: Rate change notifications
- **API Rate Monitoring**: Real-time API usage tracking
- **Multi-language Support**: Internationalization
- **PWA Support**: Progressive Web App features
- **Advanced Analytics**: Market analysis and predictions

### Technical Improvements
- **Database Integration**: Persistent data storage
- **Microservices Architecture**: Service decomposition
- **GraphQL API**: More efficient data fetching
- **Redis Caching**: Distributed caching layer
- **Kubernetes Deployment**: Container orchestration
- **CI/CD Pipeline**: Automated testing and deployment

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use ESLint configuration
- Follow JavaScript Standard Style
- Write meaningful commit messages
- Include tests for new features

## 📄 License

This project is created for educational purposes as part of the ALU curriculum. All code is original work by the student.

### Third-party Licenses
- **Node.js**: MIT License
- **Express.js**: MIT License
- **Chart.js**: MIT License
- **Font Awesome**: Font Awesome Free License

## 🆘 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a

# Build with no cache
docker build --no-cache -t alu-forex-exchange .
```

#### Load Balancer Not Working
```bash
# Check HAProxy status
docker exec lb-01 haproxy -c -f /etc/haproxy/haproxy.cfg

# Verify network connectivity
docker exec lb-01 ping web-01
docker exec lb-01 ping web-02
```

#### API Errors
- Check internet connectivity
- Verify API endpoints are accessible
- Review rate limiting settings
- Check error logs for details

### Getting Help
- Check the logs: `docker logs <container-name>`
- Verify environment variables
- Test API endpoints manually
- Review HAProxy statistics at `http://localhost:8404/stats`

## 👥 Support

For technical support or questions about this implementation:
- Review the troubleshooting section
- Check the GitHub issues
- Contact the development team

---

**Built with ❤️ for ALU - African Leadership University**

*This application demonstrates professional-grade software development practices including API integration, containerization, load balancing, and responsive web design.*
