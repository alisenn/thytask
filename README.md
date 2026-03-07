# THY Route Planner

A full-stack, comprehensive web application designed as a case study for route planning and transportation management.

This project consists of two main parts:
1. **Spring Boot Backend**: A robust REST API managing locations, transportations, JWT security, and a custom routing algorithm.
2. **React + Vite Frontend**: A modern Single Page Application (SPA) natively connecting to the API to provide interactive maps, routes, and admin management tools.

---

## 🚀 Features

- **Route Search Algorithm**: Finds routes between origin and destination with a maximum of 3 transfers (legs) and strictly 1 flight per route. Accommodates for specific operational days.
- **Admin Management Portal**: Securely view, add, delete, and modify predefined Locations and Transportations.
- **Map Visualization**: Visualizes selected routes step-by-step using interactive Leaflet maps with dynamically styled polylines (Red for Flights, Blue for transfers).
- **Authentication**: JWT-based security granting specialized access roles like `ADMIN` and `AGENCY`.
- **Database Migrations**: Integrated Liquibase ensures the PostgreSQL database always spins up cleanly with initial mock data.
- **Caching**: Redis implementation for blazingly fast lookups of existing routes.
- **Swagger Documentation**: Instantly explore API endpoints dynamically.

---

## 🛠️ Tech Stack

### Backend
* **Java 17** & **Spring Boot 3.2.3**
* **Spring Data JPA** & **Hibernate**
* **PostgreSQL** (Relational Database)
* **Redis** (Spring Cache Integration)
* **Liquibase** (Database Version Control)
* **Spring Security** (JWT Authentication)
* **Lombok & MapStruct** (Code reduction and Object Mapping)

### Frontend
* **React 18** (UI Library)
* **Vite** (Build Tool)
* **TypeScript** (Static Typing)
* **Tailwind CSS V4** (Rapid Styling)
* **React Router v6** (Client-side Routing)
* **React Leaflet** (Map Integration)
* **Lucide React** (Modern Icons)

---

## 🏃‍♂️ How to Run the Project Locally

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/en/) & [npm](https://www.npmjs.com/)

### 1. Run the Backend Infrastructure (Docker)

The easiest way to start the required backend services (PostgreSQL, Redis, and the Spring Boot App) is via Docker Compose.

```bash
cd backend
docker-compose up -d --build
```
* Note: Liquibase will automatically create the schema inside PostgreSQL and insert mock data.
* **Backend API URL:** `http://localhost:8080/api`
* **Swagger UI:** `http://localhost:8080/swagger-ui.html`

### 2. Run the Frontend (Vite Server)

In a separate terminal, navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev -- --host
```
* **Frontend Portal URL:** `http://localhost:5173`

---

## 🔐 Default Admin Credentials

To verify the administrative aspects or search for routes, open the frontend portal and login using the predefined Liquibase admin account:

* **Username:** `admin`
* **Password:** `admin`

---

## 🗺️ Example Mock Data Search

The system is pre-seeded with 4 locations:
* Istanbul Airport (IST)
* Taksim Square (TAK)
* London Heathrow (LHR)
* Wembley Stadium (WEM)

**Test Route Scenario:**
1. Login to the Frontend portal.
2. Select **Find Routes** from the sidebar.
3. Select **Origin:** `Taksim Square`
4. Select **Destination:** `Wembley Stadium`
5. Pick an **Operating Date** equivalent to Monday, Wednesday, or Friday (e.g. 2026-03-09) since the IST -> LHR flight only operates on days 1, 3, 5.
6. Observe the calculated 3-leg route with its full visual map trajectory.
