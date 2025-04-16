# Vidyalankar Bank of Credits

## Project Description

This project is a full-stack web application for managing educational courses and credits at Vidyalankar. It's built using:
- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Backend**: Node.js with Express.js
- **API**: RESTful API endpoints

The application supports different user roles (students, teachers, and administrators) and allows for course creation and management.

## Features

- **Authentication System**: Secure login for different user roles
- **Admin Dashboard**: Course creation and management interface
- **Course Management**: Create, view, and manage courses
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/combustrrr/vidyalankarbankofcredits.git
   cd vidyalankarbankofcredits
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to create a `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Modify any values in the `.env` file as needed

## Running the Project

### Development Mode

1. Start the Next.js frontend:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the Express backend:
   ```bash
   npm run dev:server
   ```

3. Or run both simultaneously:
   ```bash
   npm run dev:full
   ```

### Production Mode

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the Next.js server:
   ```bash
   npm start
   ```

3. In a separate terminal, start the Express server:
   ```bash
   npm run serve
   ```

## Project Structure

- `/pages`: Next.js page components
- `/components`: Reusable React components
- `/context`: React context providers
- `/server`: Express server code
- `/styles`: Global CSS and Tailwind configuration
- `/types`: TypeScript type definitions
- `/utils`: Utility functions and API services

## Admin Access

To access the admin dashboard:
1. Navigate to the home page
2. Click on the Admin panel
3. Use the passcode: `117110`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
