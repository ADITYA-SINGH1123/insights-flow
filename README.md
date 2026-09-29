# Insights Flow

Full-stack Sales Analytics Dashboard built with React, FastAPI and MySQL.

## Features

- JWT Authentication
- Product Management
- Customer Management
- Sales Management
- Stock Validation
- Sales Analytics
- Revenue and Order Summary
- Daily and Monthly Charts
- Analytics Filters
- Responsive UI

## Technology Stack

- Frontend: React, Vite, Recharts, CSS
- Backend: Python, FastAPI, Pydantic, JWT, bcrypt
- Database: MySQL 8

## Project Structure

`text insights-flow/ +-- backend/ +-- frontend/ +-- sql/ `

## Run Backend

`powershell python -m uvicorn app.main:app --reload `

## Run Frontend

`powershell npm install npm run dev `

## Security

- Password hashing with bcrypt
- JWT authentication
- Protected API endpoints
- Environment-based secrets
- CORS configuration through environment variables
- .env excluded frhor
  Aditya Singh
