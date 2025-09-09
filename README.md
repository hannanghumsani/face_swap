Server-Rendered Face Swap App
This is a server-rendered web application built with Node.js, Express, and EJS. It features a form for user information and image uploads, which are processed by the LightX API for face swapping. The application then stores the user data and the final swapped image in a MongoDB Atlas database and displays them in a public gallery.

Features

Secure Input Handling: All user inputs are validated for correctness (e.g., email format, file size) and sanitized to prevent security vulnerabilities.

External API Integration: Uses the LightX API for the AI face-swap functionality.

Database Persistence: User records and image data are stored using the native MongoDB driver (no ORMs like Mongoose).

Dynamic Gallery: A page dynamically lists all submissions, showing the original image, the swapped image, and a direct download link.

Tech Stack
Backend: Node.js, Express.js

Templating: EJS

Database: MongoDB Atlas (native driver)

File Handling: Multer

API Client: Axios

Setup and Installation
Prerequisites
Node.js (v14 or higher)

MongoDB Atlas account

LightX API Key

Steps
Clone the repository:

Bash

git clone <repository_url>
cd <project_directory>
Install project dependencies:

Bash

npm install
Create and configure your .env file:
Create a file named .env in the root directory and add your credentials.

Code snippet

MONGODB_URI="your_mongodb_connection_string"
DB_NAME="your_database_name"
LIGHTX_API_KEY="your_lightx_api_key"
Create upload directories:
The application requires specific folders for temporary and permanent file storage.

Bash

mkdir uploads
mkdir public/uploads
How to Run
To start the server, execute the following command in your terminal:

Bash

node app.js
The server will launch on http://localhost:3000.

Endpoints
GET /: The main form for user input and image upload.

POST /submit: Processes the form submission, interacts with the face-swap API, and saves the result to the database.

GET /submissions: Displays a gallery of all submitted face-swapped images.

GET /submissions/download/:id: Serves the final swapped image for download.
