# BookBuddy - Book Exchange Platform

BookBuddy is a platform that allows users to share, exchange, and borrow books within a community. This application is built with Next.js for the frontend, Express.js for the backend, and PostgreSQL for the database.

## Link 

https://book-xchange-nine.vercel.app/

## Repository Structure

```
bookbuddy/
├── client/                  # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions, API client
│   ├── public/              # Static assets
│   └── ...
├── server/                  # Express.js backend
│   ├── prisma/              # Prisma schema and migrations
│   ├── src/                 # Server source code
│   │   ├── routes/          # API routes
│   │   ├── uploads/         # Book cover images storage
│   │   └── index.ts         # Server entry point
│   └── ...
├── .env.example             # Example environment variables
├── README.md                # This file
└── ...
```

## Features

BookBuddy allows users to:

- Register as book owners or seekers
- Add books to their collection with details and cover images
- Browse available books with filtering options
- Claim books from other users
- Return books after borrowing
- Manage their own book collection through a dashboard
- Edit and delete books they own

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/bookbuddy"
   JWT_SECRET="your-jwt-secret"
   ```

4. Run Prisma migrations to set up your database:
   ```
   npx prisma migrate dev
   ```

5. Start the server:
   ```
   npm run dev
   ```
   
The server will run on http://localhost:3000 by default.

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

The frontend will run on http://localhost:4000 by default.

## Working Features

- ✅ User authentication (registration, login)
- ✅ Book management (add, edit, delete)
- ✅ Book cover image upload and display
- ✅ Book browsing with filters
- ✅ Book claiming/returning functionality
- ✅ User dashboard with role-based views
- ✅ Responsive design


## Bonus Features

1. **Cover Image Management**: Users can upload, preview, and change book cover images
2. **Role-Based UI**: Different dashboard views and capabilities based on user roles
3. **Real-time Status Updates**: Book status changes are reflected immediately across the application
4. **Responsive Design**: Works well on mobile, tablet, and desktop devices
5. **Advanced Filtering**: Users can filter books by title, genre, and location

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Basic logic
- **File Storage**: Local file system (with option to extend to cloud storage)

## AI Tools Used

- **Claude AI**: Used to generate some boilerplate code and help with structuring the application
- **GitHub Copilot**: Used for code suggestions and documentation assistance

