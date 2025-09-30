# Tuition Management System (Spring Boot + MongoDB)

This project is a web-based educational institute management system focused on Admin Class Management (CRUD) and basic authentication (login/registration) using Spring Boot and MongoDB.

## Features
- Admin registration and login (basic authentication)
- Add, view/search, update, and soft-delete classes
- MongoDB Atlas integration

## How to Run
1. Configure your MongoDB Atlas URL in `src/main/resources/application.properties`.
2. Build and run the project with Maven:
   ```
   mvn spring-boot:run
   ```
3. Access the API at `http://localhost:8080/`

## Project Structure
- `model/` - Entity classes
- `repository/` - MongoDB repositories
- `service/` - Business logic
- `controller/` - REST endpoints
- `config/` - Security and application configuration

---

For more details, see the proposal and documentation files.
