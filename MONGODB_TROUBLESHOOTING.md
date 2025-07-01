# MongoDB Connection Troubleshooting Guide

If you're experiencing "Database connection failed" errors, follow these steps to resolve the issue:

## 1. Verify MongoDB Connection String

Your MongoDB connection string should follow this format:
```
mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority
```

Make sure:
- The `<database-name>` is specified (e.g., `upwork-proposal-tracker`)
- No special characters in password are properly URL-encoded
- No extra parameters causing issues

## 2. Check IP Whitelist in MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster
3. Go to Network Access
4. Make sure your deployment environment's IP is whitelisted
   - For Vercel deployments, you may need to allow access from all IPs (0.0.0.0/0)

## 3. Test Connection Locally

Run this command to test your MongoDB connection:
```
node scripts/test-mongodb.js
```

## 4. Common Errors and Solutions

### Error: "Database connection failed"
- **Cause**: Invalid connection string or network issues
- **Solution**: Check connection string format and whitelist your IP

### Error: MongoServerSelectionError
- **Cause**: Can't reach MongoDB server
- **Solution**: Check firewall settings or whitelist your IP

### Error: Authentication failed
- **Cause**: Incorrect username/password
- **Solution**: Verify credentials in your .env files

## 5. Environment Variables

Make sure the following environment variables are correctly set:
- `MONGODB_URI`: Your MongoDB connection string
- `NODE_ENV`: Should be "production" for deployment

## 6. For Vercel Deployments

1. In your Vercel dashboard, go to Project Settings > Environment Variables
2. Verify that MONGODB_URI is correctly set
3. Redeploy your application after making changes
