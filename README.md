# 🏍️ RiderConnect Backend

## 🚀 Quick Start

### Option 1: With Nodemon (Auto-reload)
```bash
npm run dev
```

### Option 2: Standard Node
```bash
node index.js
```

### Option 3: NPM Start
```bash
npm start
```

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `node index.js` | Start with node |
| `nodemon index.js` | Start with nodemon directly |
| `npm start` | Start production server |

## ✅ What Happens

Server starts on **Port 5000**:
- 🌐 API: http://localhost:5000
- 💚 Health: http://localhost:5000/api/health
- 🔐 OAuth: http://localhost:5000/api/auth/google

## 🔧 Environment Variables

Create `.env` file with:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=5000
```

## 📦 Dependencies

Install with:
```bash
npm install
```

Key packages:
- Express (Server)
- Mongoose (MongoDB)
- Passport (OAuth)
- JWT (Authentication)

## 🎯 Ready!

Just run:
```bash
npm run dev
```
