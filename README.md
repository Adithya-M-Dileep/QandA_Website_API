# Q&A Website API

The Q&A Website API provides endpoints to manage questions and answers on a Q&A platform. Users can register, login, create questions, view questions, update and delete their own questions, add answers to questions, view answers, and update or delete their own answers.

## Features

- User registration: `POST /api/register` endpoint allows users to register by providing a username and password.
- User login: `POST /api/login` endpoint enables users to log in with their registered username and password.
- Create a question: `POST /api/questions` allows users to create a new question by providing the title, description, tags, and user ID.
- View questions: `GET /api/questions` retrieves a list of questions, supporting pagination with optional query parameters for page and limit.
- Get a question by ID: `GET /api/questions/:id` retrieves a specific question by its ID.
- Update a question: `PUT /api/questions/:questionId` updates a question's title, description, and tags, given its ID.
- Delete a question: `DELETE /api/questions/:questionId` deletes a question by its ID, but only if the request is made by the user who owns the question.
- Add an answer to a question: `POST /api/questions/:id/answers` allows users to add an answer to a question by providing the question ID, user ID, and answer body.
- View answers for a question: `GET /api/questions/:id/answers` retrieves a list of answers for a specific question, supporting pagination with optional query parameters.
- Get an answer by ID: `GET /api/answers/:id` retrieves a specific answer by its ID.
- Update an answer: `PUT /api/answers/:answerId` updates an answer's body, given its ID. Only the user who owns the answer can perform this action.
- Delete an answer: `DELETE /api/answers/:answerId` deletes an answer by its ID, but only if the request is made by the user who owns the answer.

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. Users must register and obtain a token by logging in to access protected routes. The token should be included in the `Authorization` header of each request as a Bearer token.

## Error Handling

The API returns appropriate HTTP status codes and error messages in case of errors or invalid requests. Refer to the API documentation for details on error responses.

## API Documentation

[API Documentation](https://documenter.getpostman.com/view/21098148/2s93sjV9QV)

## Getting Started

To get started with the Q&A Website API, follow these steps:

1. Clone the repository.
2. Install the required dependencies by running `npm install`.
3. Start the server by running `npm start`.

Make sure you have MongoDB running locally or provide the connection URI in the code to connect to your MongoDB instance.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Tokens)
