# 💻 Setup Local MongoDB (No Internet Required)

## Why Use Local MongoDB?
- No internet dependency
- Faster development
- No network issues
- Free forever

## 📥 Installation Steps

### Step 1: Download MongoDB Community Server

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.x or 6.x)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB

1. Run the downloaded .msi file
2. Choose "Complete" installation
3. ✅ Check "Install MongoDB as a Service"
4. ✅ Check "Install MongoDB Compass" (GUI tool)
5. Click "Next" and "Install"

### Step 3: Verify Installation

```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Should show:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  MongoDB            MongoDB Server
```

### Step 4: Update Backend Configuration

Edit `I:\code\backend\.env`:

```env
# Change from Atlas to Local
MONGODB_URI=mongodb://localhost:27017/bike-community

# Keep the rest same
JWT_SECRET=GGVvPgxroN640S6KydZ67lT2dKFhKEmb
PORT=5000
NODE_ENV=development
```

### Step 5: Restart Backend

```bash
cd I:\code\backend

# Kill existing process
Get-Process node | Stop-Process -Force

# Restart
npm run dev
```

You should see:
```
🚀 Connected to MongoDB
```

### Step 6: Seed Sample Data

```bash
node seed-data.js
```

## 🎯 Using MongoDB Compass (GUI)

MongoDB Compass is automatically installed. Use it to:
- View databases and collections
- Browse documents
- Run queries
- Monitor performance

**Connect to:** `mongodb://localhost:27017`

## ✅ Advantages of Local MongoDB

| Feature | Local MongoDB | MongoDB Atlas |
|---------|---------------|---------------|
| Internet Required | ❌ No | ✅ Yes |
| Setup Time | 5 minutes | Account needed |
| Speed | ⚡ Fast | Depends on network |
| Cost | 🆓 Free | Free tier limited |
| Data Privacy | 🔒 Your machine | Cloud stored |

## 🚀 Quick Commands

```bash
# Start MongoDB Service
net start MongoDB

# Stop MongoDB Service
net stop MongoDB

# Check Status
Get-Service MongoDB
```

## 📊 Using with Your App

Once local MongoDB is running:

1. Backend connects instantly
2. No network errors
3. All features work offline
4. Data stored locally in: `C:\Program Files\MongoDB\Server\7.0\data\`

## 🔄 Switch Back to Atlas

To switch back to MongoDB Atlas:

```env
# Just change .env back to:
MONGODB_URI=mongodb+srv://swapnil:swapnil@cluster0.3qquf.mongodb.net/bike-community?retryWrites=true&w=majority
```

No code changes needed!

