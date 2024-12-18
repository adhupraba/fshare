# **FShare - File Sharing Application**

FShare is a secure and robust file-sharing application that enables users to upload, share, and manage encrypted files. It includes a **Django backend** (server) for handling API requests and business logic, and a **React/Vite frontend** (client) for the user interface.

---

## **Table of Contents**

- [Setup Instructions](#setup-instructions)
  - [Running with Docker](#running-with-docker)
  - [Running Locally](#running-locally)
    - [Backend Setup](#backend-setup-django-server)
    - [Frontend Setup](#frontend-setup-react-client)
- [Application Workflow](#application-workflow)
- [API Access](#api-access)
- [Troubleshooting](#troubleshooting)

---

## **Setup Instructions**

### **Running with Docker**

The project includes a Docker setup for running both the client and server simultaneously.

1. **Setup Environment Variables**:

- In the project root, copy `.env.example` to `.env`:

  ```bash
  cp .env.example .env
  ```

- Update the `.env` file with appropriate values

2. **Custom certificates for SSL/TLS**

- The client docker image by default creates a self signed SSL certificate with a validity of 1 year

- To overwrite the certificate that comes with the docker image:

  - Create a `certs` folder in the root of the project

    ```bash
    mkdir certs
    ```

  - Generate self signed SSL certificates

    ```bash
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout certs/server.key -out certs/server.crt \
      -subj "/CN=localhost"
    ```

  - Add `volumes` to `client` service pointing to the `certs` folder:

    ```bash
    volumes:
        - ./certs/server.crt:/etc/nginx/certs/server.crt
        - ./certs/server.key:/etc/nginx/certs/server.key
    ```

3. **Build and Run the Docker Containers**:

- From the project root directory, run:

  ```bash
  docker compose up --build
  ```

4. **Access the application**:

- Frontend: `https://localhost`

- Backend: `http://localhost:8000`

5. **Create super user for Django admin**:

- To create a super user for accessing the admin portal:

  ```bash
  docker exec -it <backend_container_id> sh
  ```

  ```bash
  python manage.py createsuperuser
  ```

6. **Self signed certificates**

- The source code comes with a one year valid self signed `SSL` certificate to enable `HTTPS` communication with the backend.

---

### **Running Locally**

#### **Backend Setup (Django Server)**

1. **Create a Virtual Environment**:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
```

2. **Navigate to the Server Directory**:

```bash
cd server
```

3. **Install Dependencies**:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. **Setup Environment Variables**:

- Copy `.env.example` to `.env`:

  ```bash
  cp .env.example .env
  ```

- Update the `.env` file with appropriate values

5. **Apply Migrations**:

```bash
python manage.py migrate
```

6. **Create a super user to access the Django admin portal**:

```bash
python manage.py createsuperuser
```

7. **Start the Server**:

```bash
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000/`.

---

#### **Frontend Setup (React/Vite Client)**

1. **Navigate to the Client Directory**:

```bash
cd client
```

2. **Install Dependencies**:

```bash
npm install
```

3. **Setup Environment Variables**:

- Copy `.env.example` to `.env`:

  ```bash
  cp .env.example .env
  ```

- Update the `.env` file with appropriate values

4. **Start the Frontend Development Server**:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173/`.

---

## **Application Workflow**

The following sequence diagram ilustrates the flow of the application:

![FShare Sequence Diagram](sequence-diagram.png)

It shows how the client and server interact during user registration, user login, file upload and file sharing workflows.

---

## **API Access**

To test backend endpoints, use tools like Postman or curl.
Example endpoint for login:

```bash
POST http://127.0.0.1:8000/api/auth/login/
```

For full API documentation, refer to the backend `urls.py`.

---

## **Troubleshooting**

### **Backend Issues**:

- Verify that the `.env` file exists and contains correct values.

- Check database migrations:

  ```bash
  python manage.py showmigrations
  python manage.py migrate
  ```

### **Frontend Issues**:

- Ensure the `VITE_API_URL` matches your backend server URL.

- Restart the frontend development server:

  ```bash
  npm run dev
  ```

### **Docker Issues**:

- If volumes are not persisting, ensure permissions are correct for `server/data` and `server/media`.

- Rebuild containers to apply changes:

  ```bash
  docker-compose down --volumes
  docker-compose up --build
  ```

---

You’re now ready to run and develop FShare locally or using Docker! 🚀
