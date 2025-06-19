# SkillShikhi

A platform for skill sharing and learning built with Next.js and MongoDB, following MVC architecture.

## Architecture

This project follows the Model-View-Controller (MVC) architecture with an additional service layer to enhance maintainability and scalability. For detailed information about the architecture, please refer to the [MVC-ARCHITECTURE.md](./MVC-ARCHITECTURE.md) file.

### Key Features

- **MVC Architecture**: Clear separation of concerns between models, views, and controllers
- **Service Layer**: Specialized services for cross-cutting concerns like notifications and database operations
- **Configuration Management**: Centralized configuration for easy environment management
- **Standardized API Responses**: Consistent response format across all endpoints
- **Input Validation**: Comprehensive validation utilities for user input
- **Structured Logging**: Centralized logging service for better debugging and monitoring

### Benefits

- **Maintainability**: Well-organized code that's easier to understand and modify
- **Scalability**: New features can be added without affecting existing functionality
- **Reusability**: Controllers and services can be reused across the application
- **Testability**: Components can be tested in isolation
- **Consistency**: Standardized patterns for common operations

## Getting Started

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/skillshikhi
MONGODB_DB=skillshikhi

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=SkillShikhi <noreply@skillshikhi.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application
BASE_URL=http://localhost:3000
```

### Installation

Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Project Structure

```
SkillShikhi/
├── app/                  # Next.js app router pages and API routes
│   ├── api/              # API endpoints (using controllers)
│   └── ...               # Page routes
├── components/           # Shared UI components
├── config/               # Centralized configuration management
├── controllers/          # Business logic organized by feature
│   ├── auth/             # Authentication controllers
│   ├── user/             # User-related controllers
│   ├── skill/            # Skill-related controllers
│   ├── session/          # Session-related controllers
│   └── ...               # Other feature controllers
├── lib/                  # Core libraries and integrations
├── middleware/           # Request middleware
├── models/               # Data models
├── public/               # Static assets
├── services/             # Service layer for complex operations
│   ├── databaseService.js # Database connection and operations
│   ├── loggerService.js  # Centralized logging functionality
│   ├── notificationService.js # Email and notification handling
│   └── ...               # Other services
├── utils/                # Helper functions
│   ├── apiResponse.js    # Standardized API response formatting
│   ├── validation.js     # Input validation utilities
│   └── ...               # Other utilities
└── views/                # Feature-specific view components
    ├── auth/             # Authentication views
    ├── user/             # User-related views
    ├── skill/            # Skill-related views
    └── ...               # Other feature views
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

