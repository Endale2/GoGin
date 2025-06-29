# UniQ&A - Ethiopian Student Platform

A real-time student platform designed specifically for Ethiopian universities, featuring institutional email validation and department-specific discussions.

## Features

### 🔐 Institutional Email Validation
- **Exclusive Access**: Only students with `.edu.et` email addresses can register
- **University Verification**: Automatic institution detection from email domain
- **Supported Universities**: AAU, ASTU, BDU, JU, MU, and more Ethiopian institutions

### 👥 Student Features
- **Department-specific Discussions**: Ask questions related to your field of study
- **Real-time Collaboration**: Connect with peers from your university
- **Course Management**: Enroll in courses and track your academic progress
- **Profile Management**: Update your student information and profile picture

### 🏛️ Academic Integration
- **University Database**: Pre-populated with Ethiopian universities and departments
- **Course Catalog**: Comprehensive list of courses across different departments
- **Student Verification**: Secure authentication system for verified students

## Technology Stack

### Backend
- **Go** with Gin framework
- **MongoDB** for database
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Router** for navigation

## Installation & Setup

### Prerequisites
- Go 1.23.2 or higher
- Node.js 18 or higher
- MongoDB instance
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd go-gin
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in server directory
   export JWT_SECRET_KEY="your-secret-key-here"
   export MONGODB_URI="your-mongodb-connection-string"
   ```

3. **Install Go dependencies**
   ```bash
   cd server
   go mod tidy
   ```

4. **Populate database with sample data**
   ```bash
   go run scripts/populateData.go
   ```

5. **Run the server**
   ```bash
   go run main.go
   ```
   Server will start on `http://localhost:8080`

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   Client will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register with institutional email
- `POST /auth/login` - Login with institutional credentials
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile
- `POST /auth/edit-profile` - Update user profile

### Courses
- `GET /courses/` - Get all courses
- `GET /courses/:id` - Get specific course
- `POST /courses/` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Questions & Answers
- `GET /questions/` - Get all questions
- `POST /questions/` - Create new question
- `GET /questions/:id` - Get specific question
- `POST /questions/:id/answers` - Add answer to question

## Institutional Email Validation

### Supported Email Domains
The platform validates and accepts emails from the following Ethiopian universities:

- **AAU** - `@aau.edu.et` (Addis Ababa University)
- **ASTU** - `@astu.edu.et` (Adama Science and Technology University)
- **BDU** - `@bdu.edu.et` (Bahir Dar University)
- **JU** - `@ju.edu.et` (Jimma University)
- **MU** - `@mu.edu.et` (Mekelle University)

### Validation Rules
- Email must end with `.edu.et`
- Must follow standard email format
- Institution name must be at least 2 characters
- Case-insensitive validation

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-100 chars),
  email: String (required, .edu.et domain),
  password: String (hashed, required, min 8 chars),
  phone_number: String (optional),
  department_id: ObjectId (optional),
  university_id: ObjectId (optional),
  student_id: String (optional),
  year_of_study: Number (optional, 1-6),
  added_courses: [ObjectId],
  joined_at: Date,
  profile_image: String (optional),
  is_verified: Boolean,
  last_active: Date
}
```

### Universities Collection
```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  website: String,
  departments: [String],
  established: Number
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String,
  department: String,
  code: String
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for passwords
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Institutional Verification**: Email domain validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This platform is specifically designed for Ethiopian university students. Only institutional emails ending with `.edu.et` are accepted for registration. 