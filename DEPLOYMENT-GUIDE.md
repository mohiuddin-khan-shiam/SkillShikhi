# SkillShikhi Deployment Guide

This guide provides step-by-step instructions for deploying the SkillShikhi application to Vercel using a GitHub repository.

## Prerequisites

- GitHub account
- Vercel account (can sign up with GitHub)
- Node.js and npm installed locally
- MongoDB Atlas account (for production database)

## Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/SkillShikhi.git
   cd SkillShikhi
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Server
   PORT=3000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/skillshikhi
   MONGODB_DB=skillshikhi

   # Authentication
   JWT_SECRET=your-dev-secret-key
   JWT_EXPIRES_IN=7d

   # Email (for password reset)
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@example.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=SkillShikhi <noreply@skillshikhi.com>

   # Application
   BASE_URL=http://localhost:3000

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## GitHub Setup

1. Create a new GitHub repository
2. Connect your local repository to GitHub:
   ```
   git remote add origin https://github.com/your-username/SkillShikhi.git
   git branch -M main
   git push -u origin main
   ```

## MongoDB Atlas Setup

1. Sign up for a free MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster (the free tier is sufficient for getting started)
3. Set up database access:
   - Create a new database user with read/write privileges
   - Make note of the username and password
4. Configure network access:
   - Add your current IP address for local development
   - Add `0.0.0.0/0` for Vercel deployment (you can restrict this later)
5. Obtain your MongoDB connection string from Atlas
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string, which will look like:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
     ```
   - Replace `<username>`, `<password>`, and `<dbname>` with your values

## Vercel Deployment

1. Sign up for Vercel: https://vercel.com/signup
2. Import your GitHub repository:
   - From the Vercel dashboard, click "Add New" → "Project"
   - Choose "Import Git Repository" and select your GitHub repository
   - Authorize Vercel to access your GitHub if prompted

3. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

4. Configure environment variables:
   - Click on "Environment Variables"
   - Add the following environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/skillshikhi?retryWrites=true&w=majority
     MONGODB_DB=skillshikhi
     JWT_SECRET=your-production-secret-key
     JWT_EXPIRES_IN=7d
     BASE_URL=https://your-vercel-app-name.vercel.app
     ```
   - Add any additional environment variables needed for email and Cloudinary

5. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

6. Verify the deployment:
   - Once the deployment is complete, Vercel will provide a URL for your application
   - Visit the URL to verify that your application is working correctly

## Continuous Deployment

Vercel automatically sets up continuous deployment for your project. Any push to the main branch of your GitHub repository will trigger a new deployment.

## Custom Domain (Optional)

1. From your Vercel project dashboard, click on "Domains"
2. Add your custom domain and follow the instructions to configure DNS settings

## Troubleshooting

- **Database connection issues**: Ensure your MongoDB Atlas connection string is correct and that the database user has appropriate permissions.
- **Missing environment variables**: Verify all required environment variables are set in Vercel.
- **Build failures**: Check the build logs in Vercel for specific errors.

## Security Considerations

- Always use environment variables for sensitive information
- Never commit .env files to your repository
- Regularly update dependencies to patch security vulnerabilities
- Consider implementing rate limiting for login and API endpoints
- Monitor your application for unusual activity

## Maintenance

- Regularly backup your database
- Monitor application performance using Vercel Analytics
- Update dependencies to keep your application secure 