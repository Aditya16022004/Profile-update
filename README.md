# User Profile Demo

A simple user profile management application with MongoDB persistence, built with Node.js and Express.

## Features

- User profile creation with image upload
- MongoDB database persistence
- Docker containerization
- MongoExpress web interface for database management
- Automatic database initialization

## Prerequisites

- Docker and Docker Compose installed
- Node.js (for local development)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-profile-demo
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Main application: http://localhost:3000
   - MongoDB web interface: http://localhost:8081
     - Username: Aditya
     - Password: password

## Database Persistence

The application is configured with persistent storage:

- **MongoDB Data**: Stored in Docker named volume `mongodb_data`
- **Uploaded Images**: Stored in `./uploads/` directory
- **Configuration**: Managed via `config.env` file

### Data Persistence After Container Restart

When you run `docker-compose down` and then `docker-compose up -d`:

1. **Database data persists**: All user profiles and data remain intact
2. **Uploaded images persist**: Profile images are preserved
3. **Configuration persists**: Environment variables are maintained

## Configuration

Edit `config.env` to customize:

```env
# MongoDB Configuration
MONGO_URL=mongodb://Aditya:password@localhost:27017/
DB_NAME=user-account
COLLECTION_NAME=user-details

# Application Configuration
NODE_ENV=development
PORT=3000
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# View running containers
docker-compose ps
```

## Development

For local development without Docker:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB** (ensure MongoDB is running locally)

3. **Run the application**
   ```bash
   node server.js
   ```

## File Structure

```
user-profile-demo/
├── server.js              # Main application server
├── docker-compose.yaml    # Docker services configuration
├── Dockerfile            # Node.js application container
├── config.env            # Environment configuration
├── package.json          # Node.js dependencies
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── mongo-init/          # MongoDB initialization scripts
│   └── init.js
├── public/              # Static files
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── uploads/             # Uploaded images (persistent)
│   └── .gitkeep
└── views/               # HTML templates
│   └── index.html
```

## Troubleshooting

### Database Connection Issues

1. **Check if MongoDB container is running:**
   ```bash
   docker-compose ps
   ```

2. **View MongoDB logs:**
   ```bash
   docker-compose logs mongodb
   ```

3. **Reset database (WARNING: This will delete all data):**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Application Issues

1. **Check application logs:**
   ```bash
   docker-compose logs app
   ```

2. **Rebuild application:**
   ```bash
   docker-compose up -d --build
   ```

## Security Notes

- Default MongoDB credentials are set for development
- Change passwords in production
- Consider using Docker secrets for sensitive data
- Upload directory is publicly accessible

## License

This project is for demonstration purposes.
