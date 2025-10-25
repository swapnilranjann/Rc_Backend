# 🔧 Fix MongoDB Atlas Connection

## Current Issue
```
Error: querySrv ENOTFOUND _mongodb._tcp.cluster0.3qquf.mongodb.net
```

This means:
- Network can't resolve MongoDB Atlas hostname
- Possible firewall/DNS issue
- IP not whitelisted in MongoDB Atlas

## ✅ Solution Steps

### 1. Fix Network Access in MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Click on your cluster "Cluster0"
3. Click "Network Access" in left sidebar
4. Click "Add IP Address"
5. Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Confirm"

### 2. Verify Connection String

Your connection string in `.env` should be:
```
MONGODB_URI=mongodb+srv://swapnil:swapnil@cluster0.3qquf.mongodb.net/bike-community?retryWrites=true&w=majority&appName=Cluster0
```

Make sure:
- ✅ Password is correct (swapnil)
- ✅ No extra spaces
- ✅ Database name is correct (bike-community)

### 3. Alternative: Use Direct Connection (No SRV)

If SRV lookup fails, try direct connection:
```
MONGODB_URI=mongodb://swapnil:swapnil@cluster0-shard-00-00.3qquf.mongodb.net:27017,cluster0-shard-00-01.3qquf.mongodb.net:27017,cluster0-shard-00-02.3qquf.mongodb.net:27017/bike-community?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### 4. Check Your Network

```bash
# Test DNS resolution
nslookup cluster0.3qquf.mongodb.net

# Test internet connectivity
ping google.com

# Check if port 27017 is open
Test-NetConnection -ComputerName cluster0.3qquf.mongodb.net -Port 27017
```

### 5. Restart Backend

After fixing:
```bash
# Kill existing process
Get-Process node | Stop-Process -Force

# Restart
npm run dev
```

## 🎯 Quick Test

Once MongoDB connects, you should see:
```
🚀 Connected to MongoDB
```

Instead of:
```
❌ MongoDB connection error
```

