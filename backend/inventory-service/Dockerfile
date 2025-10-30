# Stage 1: Build
FROM maven:3.9.11-amazoncorretto-21 AS build
WORKDIR /app

# Copy common-dto first and install it
COPY common-dto/pom.xml ./common-dto/
COPY common-dto/src ./common-dto/src
RUN mvn -f common-dto/pom.xml clean install -DskipTests

# Copy inventory-service and build
COPY inventory-service/pom.xml .
COPY inventory-service/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM amazoncorretto:21-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8087

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8087/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
