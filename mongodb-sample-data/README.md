# MongoDB Sample Data for Learnhub LMS

This folder contains sample JSON data files for all collections in the Learnhub LMS application. These files can be imported into MongoDB Atlas or any MongoDB database.

## Collections Overview

1. **profiles.json** - User profile information (5 profiles)
2. **users.json** - User accounts with authentication details (5 users: 2 instructors, 3 students)
3. **categories.json** - Course categories (5 categories)
4. **subsections.json** - Video lessons/subsections (9 subsections)
5. **sections.json** - Course sections grouping subsections (3 sections)
6. **courses.json** - Course information (3 courses)
7. **ratingandreviews.json** - Course ratings and reviews (2 reviews)
8. **courseprogresses.json** - Student progress tracking (2 progress records)

## Data Relationships

The sample data maintains proper relationships between collections:
- Users reference Profiles through `additionalDetails`
- Courses reference Users (instructors), Categories, Sections, and RatingAndReviews
- Sections reference SubSections
- RatingAndReviews reference Users and Courses
- CourseProgresses reference Users, Courses, and SubSections

## Import Methods

### Method 1: Using MongoDB Atlas UI

1. **Log in to MongoDB Atlas**
   - Go to https://cloud.mongodb.com/
   - Sign in to your account

2. **Navigate to your Cluster**
   - Click on "Browse Collections"
   - Select your database (or create a new one)

3. **Import Each Collection**
   - For each JSON file, click "Add Data" → "Insert Document"
   - Or use "Import File" option if available
   - Import in this order to maintain referential integrity:
     1. profiles.json → `profiles` collection
     2. users.json → `users` collection
     3. categories.json → `categories` collection
     4. subsections.json → `subsections` collection
     5. sections.json → `sections` collection
     6. courses.json → `courses` collection
     7. ratingandreviews.json → `ratingandreviews` collection
     8. courseprogresses.json → `courseprogresses` collection

### Method 2: Using MongoDB Compass

1. **Install MongoDB Compass**
   - Download from https://www.mongodb.com/try/download/compass

2. **Connect to your Database**
   - Use your MongoDB connection string

3. **Import Collections**
   - For each collection, click "ADD DATA" → "Import JSON or CSV file"
   - Select the corresponding JSON file
   - Ensure "Stop on errors" is unchecked for bulk imports
   - Click "Import"

### Method 3: Using mongoimport CLI

```bash
# Replace <connection-string> with your MongoDB connection string
# Replace <database-name> with your database name

mongoimport --uri="<connection-string>" --db=<database-name> --collection=profiles --file=profiles.json --jsonArray

mongoimport --uri="<connection-string>" --db=<database-name> --collection=users --file=users.json --jsonArray

mongoimport --uri="<connection-string>" --db=<database-name> --collection=categories --file=categories.json --jsonArray

mongoimport --uri="<connection-string>" --db=<database-name> --collection=subsections --file=subsections.json --jsonArray

mongoimport --uri="<connection-string>" --db=<database-name> --collection=sections --file=sections.json --jsonArray

mongoimport --uri="<connection-string>" --db=<database-name> --collection=courses --file=courses.json --jsonArray

mongoimport --uri="<connection-string>" --db=<database-name> --collection=ratingandreviews --file=ratingandreviews.json --jsonArray

mongoimport --uri="<connection-string>" --db=<database-name> --collection=courseprogresses --file=courseprogresses.json --jsonArray
```

### Method 4: Using MongoDB Shell (mongosh)

```javascript
// Connect to your database
use your-database-name

// Load and insert each collection
load('profiles.json')
db.profiles.insertMany(/* paste content from profiles.json */)

load('users.json')
db.users.insertMany(/* paste content from users.json */)

// Repeat for other collections...
```

## Sample Data Details

### Users
- **John Doe** (Instructor) - john.doe@example.com
  - Teaches: React Course, MERN Stack Course
  
- **Emily Williams** (Instructor) - emily.williams@example.com
  - Teaches: Data Science Course
  
- **Sarah Smith** (Student) - sarah.smith@example.com
  - Enrolled in: React Course
  
- **Mike Johnson** (Student) - mike.johnson@example.com
  
- **Alex Brown** (Student) - alex.brown@example.com
  - Enrolled in: MERN Stack Course

### Courses
1. **Complete React Development Course** - ₹2,999
2. **Full Stack Development with MERN** - ₹4,999
3. **Data Science with Python - Complete Bootcamp** - ₹3,999

### Categories
- Web Development
- Mobile Development
- Data Science
- Cloud Computing
- Cybersecurity

## Important Notes

1. **Passwords**: All user passwords in the sample data are hashed. The actual password used is a placeholder. You'll need to update these with properly hashed passwords if you want to test authentication.

2. **ObjectIds**: The ObjectIds are pre-defined to maintain relationships. MongoDB will recognize these when importing.

3. **Image URLs**: Sample image URLs are used from Unsplash and dicebear API. These are placeholder images.

4. **Video URLs**: Video URLs are sample YouTube links. Replace with actual video URLs for production use.

5. **OTP Collection**: The OTP collection is not included as OTP documents are temporary and expire after 5 minutes. They are generated dynamically during user registration.

## Verification

After importing, verify the data by running these queries in MongoDB:

```javascript
// Check all collections
db.users.countDocuments()        // Should return 5
db.profiles.countDocuments()     // Should return 5
db.categories.countDocuments()   // Should return 5
db.courses.countDocuments()      // Should return 3
db.sections.countDocuments()     // Should return 3
db.subsections.countDocuments()  // Should return 9
db.ratingandreviews.countDocuments()  // Should return 2
db.courseprogresses.countDocuments()  // Should return 2

// Verify relationships
db.users.findOne({ firstName: "John" })
db.courses.find({ instructor: ObjectId("65a1b2c3d4e5f6a7b8c9d0f1") })
```

## Troubleshooting

- **Import Errors**: Make sure to import collections in the order specified to avoid reference errors
- **Duplicate Keys**: If re-importing, drop existing collections first or use `upsert` option
- **Connection Issues**: Verify your MongoDB connection string and network access settings in Atlas

## Next Steps

After importing the sample data:
1. Update the `.env` file with your MongoDB connection string
2. Start the backend server: `cd backend && npm start`
3. Test the API endpoints with the sample data
4. Login using the sample user credentials (after updating passwords)

Happy Learning! 🚀
