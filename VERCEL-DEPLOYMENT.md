# Vercel Deployment Guide for SkillShikhi

## Environment Variables

The SkillShikhi application requires several environment variables to function properly. When deploying to Vercel, you need to configure these in your Vercel project settings.

### Required Environment Variables

```
# MongoDB connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority

# JWT configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email service configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM="SkillShikhi <your_email@example.com>"

# Cloudinary credentials for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Setting Up Environment Variables in Vercel

1. Go to your Vercel dashboard and select your SkillShikhi project
2. Navigate to the "Settings" tab
3. Scroll down to the "Environment Variables" section
4. Add each environment variable with its corresponding value
5. Make sure to click "Save" after adding all variables

## Deployment Troubleshooting

If you encounter issues during deployment, check the following:

1. Ensure all required environment variables are set correctly
2. Verify your MongoDB connection string is valid and accessible from Vercel
3. Check that your JWT secret is properly configured
4. Make sure email service credentials are correct

## Local Development vs. Production

For local development, you can use the `.env.local` file. For production deployment on Vercel, you must set the environment variables in the Vercel dashboard as described above.

## Vercel Deployment Best Practices

1. Use a production MongoDB database cluster, not your development database
2. Set a strong, unique JWT secret for production
3. Consider using environment-specific settings for development, staging, and production
4. Regularly rotate API keys and secrets for security
