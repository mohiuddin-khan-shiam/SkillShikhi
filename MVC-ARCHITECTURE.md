# SkillShikhi MVC Architecture

## Overview

This document outlines the Model-View-Controller (MVC) architecture implemented in the SkillShikhi application. The refactoring was done to enhance maintainability and scalability while preserving all existing functionality. The architecture has been extended with a service layer and other improvements to further enhance code organization and maintainability.

## Architecture Components

### Models

Models represent the data structures and business logic of the application. They are responsible for:

- Defining the schema for database collections
- Handling data validation
- Implementing data-related business logic

**Location**: `/models`

### Views

In a Next.js application, views are represented by the components and pages that render the user interface. They are responsible for:

- Rendering data to the user
- Capturing user input
- Sending user actions to controllers

**Locations**:
- `/app` - Next.js app router pages
- `/components` - Reusable UI components
- `/views` - View-specific components organized by feature

### Controllers

Controllers act as intermediaries between models and views. They are responsible for:

- Processing incoming requests
- Interacting with models to fetch or manipulate data
- Returning appropriate responses

**Location**: `/controllers`

### Services

Services handle complex operations that may span multiple controllers or require specialized functionality. They are responsible for:

- Providing reusable business logic
- Handling cross-cutting concerns like notifications and logging
- Abstracting external service integrations

**Location**: `/services`

### Utilities

Utilities provide helper functions and standardized patterns for common tasks. They are responsible for:

- Providing reusable helper functions
- Standardizing response formats
- Handling validation and error formatting

**Location**: `/utils`

### Configuration

Centralized configuration management for application settings and environment variables.

**Location**: `/config`

## Directory Structure

```
SkillShikhi/
├── app/                  # Next.js app router pages and API routes
│   ├── api/              # API endpoints (now using controllers)
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

## Implementation Details

### API Routes

API routes in `/app/api` have been refactored to use controllers. Each route now:

1. Handles authentication and request parsing
2. Calls the appropriate controller method
3. Returns the controller's response using standardized utilities

This separation of concerns makes the code more maintainable and testable.

### Controllers

Controllers are organized by feature and contain the business logic for each feature. They:

1. Receive data from API routes
2. Validate input data using validation utilities
3. Interact with models and services to perform operations
4. Return standardized response objects

### Service Layer

The service layer provides specialized functionality that can be used across multiple controllers:

1. **Database Service**: Centralizes database connection management and operations
2. **Notification Service**: Handles email notifications and user alerts
3. **Logger Service**: Provides standardized logging across the application

### Configuration Management

The configuration system centralizes all environment variables and application settings:

1. Organizes settings by functional area (server, database, auth, etc.)
2. Provides default values for optional settings
3. Makes configuration easily accessible throughout the application

### Utilities

Utility functions standardize common operations:

1. **API Response**: Standardizes response format across all API endpoints
2. **Validation**: Provides input validation for user data and requests

### Models

Models remain largely unchanged, continuing to define the data schema and validation rules.

## Benefits of MVC Architecture with Service Layer

- **Separation of Concerns**: Each component has a specific responsibility
- **Maintainability**: Easier to understand and modify code
- **Testability**: Components can be tested in isolation
- **Scalability**: New features can be added without affecting existing code
- **Reusability**: Controllers and services can be used by multiple routes or other services
- **Standardization**: Consistent patterns for common operations
- **Error Handling**: Centralized and consistent error handling
- **Logging**: Comprehensive logging for debugging and monitoring

## Future Improvements

- Complete the refactoring of any remaining API routes to use controllers
- Add more specialized services for other cross-cutting concerns
- Implement comprehensive unit and integration tests for controllers and services
- Add request rate limiting and additional security measures
- Implement caching for frequently accessed data
- Create a documentation system for API endpoints
