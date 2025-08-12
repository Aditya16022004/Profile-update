// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Note: This script will use the database name from MONGO_INITDB_DATABASE environment variable
// which is set in docker-compose.yaml to use ${DB_NAME:-user-account}

// The database will be created automatically when the Node.js app connects
// Collections will be created dynamically by the Node.js app based on COLLECTION_NAME environment variable

print('MongoDB database initialized successfully!');
print('Database name: ' + db.getName());
print('Collections will be created dynamically by the Node.js application');
