# CDR Analytics Backend

A Node.js backend API for Call Detail Records (CDR) analytics and telecommunications intelligence system. Built with Express.js and MongoDB.

## Prerequisites

- Node.js (version 18 or higher)
- MongoDB (version 5.0 or higher)
- npm package manager

## MongoDB Setup

### Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition:**
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **macOS**: Use Homebrew: `brew install mongodb-community`
   - **Linux**: Follow the [official installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB service:**
   - **Windows**: MongoDB should start automatically as a service
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string from the Atlas dashboard

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the `backend` directory and set the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/cdr-analytics

# Server Configuration
PORT=5000

# Optional: Add other environment variables as needed
```

**Important:** Replace `cdr-analytics` with your preferred database name.

### For MongoDB Atlas users:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cdr-analytics?retryWrites=true&w=majority
```

## Running Locally

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The API server will be available at `http://localhost:5000`.

## Database Schema

The application uses the following main collections:

### CallRecord Collection
```javascript
{
  batchId: String,        // Unique identifier for upload batch
  aNumber: String,        // Calling party number
  bNumber: String,        // Called party number
  callType: String,       // 'Incoming', 'Outgoing', or 'SMS'
  imei: String,           // Device IMEI
  imsi: String,           // Device IMSI
  duration: Number,       // Call duration in seconds
  site: String,           // Cell site identifier
  latitude: Number,       // Geographic latitude
  longitude: Number,      // Geographic longitude
  cellId: String,         // Cell ID
  startTime: Date,        // Call start timestamp
  endTime: Date,          // Call end timestamp
  rawData: Object,        // Original data from upload
  createdAt: Date,        // Record creation timestamp
  updatedAt: Date         // Record update timestamp
}
```

## File Processing

The backend processes uploaded files in memory and stores the normalized data in MongoDB:

- **CSV Files**: Parsed using `csv-parser`
- **Excel Files**: Parsed using `xlsx` library
- **Memory Storage**: Files are processed in memory (no disk storage)
- **Data Normalization**: Raw data is normalized and validated before storage

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (auto-restart)

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Health Check

The API includes a health check endpoint:

```bash
GET http://localhost:5000/health
```

Returns: `{"status": "ok"}`

## Development Notes

- The application uses in-memory file processing for better performance
- All uploaded data is normalized and stored in MongoDB
- No static file storage is used - files are processed and discarded
- CORS is enabled for frontend integration