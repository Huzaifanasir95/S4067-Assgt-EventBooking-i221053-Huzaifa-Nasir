
---

# CS4067 - Assignment 02: Online Event Booking Platform

## Overview

This repository contains the deliverables for **Assignment 02** of the **CS4067 DevOps and Cloud Native** course. The project extends the Online Event Booking Platform developed in Assignment 01 by containerizing its microservices using Docker, orchestrating them with Docker Compose, and deploying them to a Kubernetes cluster with proper configuration management and service exposure.

- **Name**: Huzaifa Nasir  
- **Roll No**: 22i-1053  
- **Section**: CS-B  

## GitHub Repository

The complete codebase, including Dockerfiles, Docker Compose files, Kubernetes manifests, and other deliverables, is available in this repository:  
[https://github.com/Huzaifanasir95/S4067-Assgt-EventBooking-i221053-Huzaifa-Nasir](https://github.com/Huzaifanasir95/S4067-Assgt-EventBooking-i221053-Huzaifa-Nasir)

## Assignment Deliverables

The assignment consists of five tasks to containerize and deploy the Online Event Booking Platform. Below is an overview of the tasks and their implementations:

### Task 1: Writing Dockerfiles for Each Microservice
- Dockerfiles were created for the following microservices:
  - User Service
  - Event Service
  - Booking Service
  - Notification Service
  - Frontend Service
- Base image: `node:12-alpine` (lightweight and efficient).
- Each Dockerfile specifies the working directory, copies source code and dependencies, exposes necessary ports, and defines startup commands.
- **Location**: Check the respective microservice folders for the Dockerfiles.

### Task 2: Writing a Docker Compose File
- A `docker-compose.yaml` file was developed to orchestrate all microservices.
- An online MongoDB instance (MongoDB Atlas) is used instead of local database containers, so no PostgreSQL or MongoDB containers are included.
- The file defines service configurations, environment variables for the MongoDB connection, and network settings for inter-service communication.
- **Location**: The `docker-compose.yaml` file is in the `docker-compose` branch.

### Task 3: Writing Kubernetes Deployment & Service Files
- Kubernetes manifests were written for each microservice.
- A namespace named `onlineeventbookinghuzaifanasir` was created.
- Each microservice has a combined Deployment and Service file, specifying resource limits, environment variables, and ports.
- **Location**: The Kubernetes manifests are in the `kubernetes` folder in the `kubernetes` branch.

### Task 4: Configuring Kubernetes ConfigMaps & Secrets
- **ConfigMaps**: Used for the online MongoDB connection string and API URLs for service-to-service communication.
- **Secrets**: Used to store sensitive data (e.g., MongoDB password, API keys) encoded in base64 format.
- **Location**: ConfigMaps and Secrets are defined in the `kubernetes` folder in the `kubernetes` branch (e.g., `configmap.yaml`, `secrets.yaml`).

### Task 5: Setting Up Ingress
- An Ingress resource was configured to route traffic to the Frontend Service and expose backend services via subpaths (e.g., `/api/users`, `/api/events`).
- **Ingress Controller**: Traefik was used instead of NGINX for its dynamic configuration capabilities.
- **Location**: The Ingress configuration is in the `kubernetes` folder in the `kubernetes` branch (e.g., `ingress.yaml`).

## Project Structure

- **Main Branch**: Contains the core application code for the Online Event Booking Platform.
- **docker-compose Branch**: Contains the `docker-compose.yaml` file for orchestrating the microservices.
- **kubernetes Branch**: Contains the `kubernetes` folder with all Kubernetes manifests, including:
  - Deployment and Service files for each microservice.
  - ConfigMaps (`configmap.yaml`).
  - Secrets (`secrets.yaml`).
  - Ingress configuration (`ingress.yaml`).
  - Namespace definition (`namespace.yaml`).
  - Additional scripts and configurations (e.g., `get_helm.sh`, `strip-prefix-middleware.yaml`).

## Setup and Execution Instructions

### Prerequisites
- **Docker**: Install Docker Desktop (or Docker Engine) to run the Docker Compose setup.
- **Kubernetes**: Install a Kubernetes cluster (e.g., Minikube, Kind, or a cloud provider like GKE/AKS/EKS).
- **kubectl**: Install the Kubernetes command-line tool to interact with the cluster.
- **Traefik**: Ensure Traefik is installed as the Ingress Controller in your Kubernetes cluster.
- **MongoDB Atlas**: Set up an online MongoDB instance and obtain the connection string.
- **Git**: Clone this repository to your local machine.

### Clone the Repository
```bash
git clone https://github.com/Huzaifanasir95/S4067-Assgt-EventBooking-i221053-Huzaifa-Nasir.git
cd S4067-Assgt-EventBooking-i221053-Huzaifa-Nasir
```

### Running with Docker Compose
1. Switch to the `docker-compose-services` branch:
   ```bash
   git checkout docker-compose
   ```
2. Update the `docker-compose.yaml` file with your MongoDB Atlas connection string and any other environment variables.
3. Run the application:
   ```bash
   docker-compose up --build
   ```
4. Access the application at `http://localhost:3000` (or the port specified in the `docker-compose.yaml` file).

### Running with Kubernetes
1. Switch to the `kubernetes` branch:
   ```bash
   git checkout kubernetes-services
   ```

2. Apply the Kubernetes manifests:
   ```bash
   kubectl apply -f kubernetes/namespace.yaml
   kubectl apply -f kubernetes/configmap.yaml
   kubectl apply -f kubernetes/secrets.yaml
   kubectl apply -f kubernetes/deployment-service-*.yaml
   kubectl apply -f kubernetes/ingress.yaml
   ```
3. Ensure Traefik is running as the Ingress Controller in your cluster.
4. Access the application via the Ingress URL eventbooking.local

## Screenshots
Screenshots of the working application in both Docker Compose and Kubernetes environments are included in the report (not in this repository). They demonstrate:
- The application running locally using Docker Compose, connected to an online MongoDB instance.
- The application deployed to a Kubernetes cluster, with services exposed via Traefik Ingress.

## Challenges and Solutions
- **Challenge**: Configuring the online MongoDB connection securely in Docker Compose and Kubernetes.
  - **Solution**: Used environment variables in `docker-compose.yaml` and Secrets in Kubernetes to handle credentials securely.
- **Challenge**: Setting up Traefik as the Ingress Controller.
  - **Solution**: Followed Traefik’s official documentation and tested subpath routing to ensure proper service exposure.

## Conclusion
This project successfully containerized the Online Event Booking Platform using Docker with the `node:12-alpine` base image, orchestrated it with Docker Compose (without local database containers), and deployed it to Kubernetes in the `onlineeventbookinghuzaifanasir` namespace with Traefik for Ingress. The application functions correctly in both environments, as demonstrated in the report.

---

