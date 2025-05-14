# SkillShikhi Development Guide

## Adding New Features with MVC Architecture

This guide explains how to add new features to the SkillShikhi application following the Model-View-Controller (MVC) architecture.

### 1. Create or Update Models

Models represent the data structures and business logic of the application.

```javascript
// models/NewFeature.js
import mongoose from 'mongoose';

const newFeatureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  // Add other fields as needed
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add methods or static functions if needed
newFeatureSchema.methods.someMethod = function() {
  // Method implementation
};

export default mongoose.models.NewFeature || mongoose.model('NewFeature', newFeatureSchema);
```

### 2. Create Controllers

Controllers handle the business logic and interact with models.

```javascript
// controllers/newFeature/newFeatureController.js
import NewFeature from '../../models/NewFeature';
import dbConnect from '../../lib/mongodb';

/**
 * Get all new features
 * @returns {Object} Response object with features data or error message
 */
export async function getAllNewFeatures() {
  try {
    await dbConnect();
    const features = await NewFeature.find().sort({ createdAt: -1 });
    return { success: true, features, status: 200 };
  } catch (error) {
    console.error('Error fetching features:', error);
    return { success: false, message: 'Internal Server Error', status: 500 };
  }
}

/**
 * Create a new feature
 * @param {Object} featureData - Feature data
 * @returns {Object} Response object with created feature or error message
 */
export async function createNewFeature(featureData) {
  try {
    await dbConnect();
    const feature = new NewFeature(featureData);
    await feature.save();
    return { success: true, feature, status: 201 };
  } catch (error) {
    console.error('Error creating feature:', error);
    return { success: false, message: 'Internal Server Error', status: 500 };
  }
}
```

### 3. Create API Routes

API routes handle HTTP requests and use controllers to process them.

```javascript
// app/api/new-features/route.js
import { NextResponse } from 'next/server';
import { getAllNewFeatures, createNewFeature } from '../../../controllers/newFeature/newFeatureController';
import { handleControllerResponse, errorResponse } from '../../../utils/apiResponse';

// GET all features
export async function GET() {
  try {
    const result = await getAllNewFeatures();
    return handleControllerResponse(result);
  } catch (error) {
    console.error('Error in new features route:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

// POST to create a new feature
export async function POST(request) {
  try {
    const body = await request.json();
    const result = await createNewFeature(body);
    return handleControllerResponse(result);
  } catch (error) {
    console.error('Error in create feature route:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
```

### 4. Create Views (React Components)

Views render the UI and interact with the API routes.

```jsx
// views/newFeature/NewFeatureList.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NewFeatureList() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeatures() {
      try {
        const response = await axios.get('/api/new-features');
        setFeatures(response.data.features);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch features');
        setLoading(false);
      }
    }

    fetchFeatures();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Features</h1>
      <ul>
        {features.map(feature => (
          <li key={feature._id}>
            <h2>{feature.name}</h2>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. Create Page Components

Page components use the views and are rendered by Next.js.

```jsx
// app/new-features/page.js
import NewFeatureList from '../../views/newFeature/NewFeatureList';

export default function NewFeaturesPage() {
  return (
    <div className="container mx-auto py-8">
      <NewFeatureList />
    </div>
  );
}
```

## Best Practices

1. **Separation of Concerns**: Keep models, controllers, and views separate.
2. **Consistent Naming**: Use consistent naming conventions for files and functions.
3. **Error Handling**: Implement proper error handling in controllers and API routes.
4. **Validation**: Validate input data in controllers before processing.
5. **Documentation**: Document your code with JSDoc comments.
6. **Testing**: Write tests for controllers and API routes.

## API Response Format

All API responses should follow this format:

```javascript
// Success response
{
  success: true,
  // Other data specific to the endpoint
  message: 'Operation successful', // Optional
  data: {...} // Optional
}

// Error response
{
  success: false,
  message: 'Error message'
}
```

Use the `apiResponse.js` utility functions to create consistent responses.
