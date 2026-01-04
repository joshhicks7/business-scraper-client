# Firestore Index Setup

This project requires a composite index for the timeline collection to query events by business ID and sort by creation date.

## Automatic Setup (Recommended)

If you have Firebase CLI installed, you can deploy the index automatically:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the client directory (if not already done)
cd client
firebase init firestore

# Deploy the index
firebase deploy --only firestore:indexes
```

## Manual Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Set the following:
   - **Collection ID**: `timeline`
   - **Fields to index**:
     - Field: `businessId`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
6. Click **Create**

## Temporary Workaround

The code includes a fallback that will query without the index and sort in memory. This works but is less efficient. The index should be created for optimal performance.

## Verify Index is Created

After creating the index, it may take a few minutes to build. You can check the status in the Firebase Console under Firestore → Indexes. Once it shows "Enabled", the query will work properly.

