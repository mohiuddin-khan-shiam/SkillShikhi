# SkillShikhi Admin Dashboard

## Overview

The SkillShikhi Admin Dashboard provides comprehensive tools for platform administration, content moderation, user management, and analytics. This document outlines the key features and components of the admin system.

## Features

### 1. Content Moderation

The content moderation system allows administrators to:

- View and filter posts, comments, and messages
- See contextual metadata (creator, timestamp, reports)
- Take moderation actions (delete, warn, flag, approve)
- Notify users about moderation decisions

**API Endpoints:**
- `GET /api/admin/content` - Retrieve content with filtering options
- `POST /api/admin/content/moderate` - Take moderation actions on content

### 2. Live Session Monitoring

The session monitoring system allows administrators to:

- View active user sessions in real-time
- See session details (IP address, user agent, device, location)
- Track session duration and user activity
- Terminate suspicious or problematic sessions

**API Endpoints:**
- `GET /api/admin/sessions` - Retrieve active and historical sessions
- `PATCH /api/admin/sessions/[id]/terminate` - Terminate a specific session

### 3. Activity Logging

The activity logging system records user actions across the platform:

- Logs important user actions (login, profile edits, content creation, etc.)
- Tracks admin actions (content moderation, user bans, etc.)
- Provides filtering by user, action type, and date range
- Includes detailed information about each action

**API Endpoints:**
- `GET /api/admin/logs` - Retrieve activity logs with filtering options
- `POST /api/admin/logs` - Create new activity log entries

**Utility Functions:**
- `utils/activityLogger.js` - Helper functions for logging various activities

### 4. Analytics and Reporting

The analytics system provides insights into platform usage and trends:

- Daily active users, new users, and session statistics
- Content engagement metrics and moderation statistics
- Most active and most reported users
- Data export options (CSV, JSON)

**API Endpoints:**
- `GET /api/admin/analytics` - Retrieve analytics data with date range filtering
- `POST /api/admin/analytics` - Generate analytics for a specific date

### 5. User Management

The user management system allows administrators to:

- View and search user profiles
- Ban and unban users
- View user activity and reports
- Manage user permissions

**API Endpoints:**
- `GET /api/admin/users` - Retrieve users with filtering options
- `PATCH /api/admin/users/[id]/ban` - Ban or unban a user

## Implementation Details

### Models

- `ActivityLog.js` - Stores user and admin actions
- `Session.js` - Tracks user sessions
- `Analytics.js` - Aggregates platform usage data

### Middleware

- `middleware/sessionTracker.js` - Automatically tracks user sessions

### Components

- `components/admin/ContentTab.js` - Content moderation interface
- `components/admin/SessionsTab.js` - Session monitoring interface
- `components/admin/LogsTab.js` - Activity logs interface
- `components/admin/AnalyticsTab.js` - Analytics and reporting interface
- `components/admin/BannedUsersTab.js` - Banned users management interface

## Security Considerations

- All admin routes require authentication with a valid admin token
- Admin actions are logged for accountability
- Session data is tracked for security monitoring
- User data is handled with appropriate privacy considerations

## Future Enhancements

- Real-time notifications for important events
- Advanced analytics with visualizations
- Automated content moderation using AI
- Enhanced security monitoring and threat detection
- Customizable admin dashboard layout
