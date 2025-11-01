# Multi-stage build for File Service

# Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy common-dto first (dependency)
COPY common-dto/pom.xml common-dto/pom.xml
COPY common-dto/src common-dto/src
RUN cd common-dto && mvn clean install -DskipTests

# Copy file-service files
COPY file-service/pom.xml file-service/pom.xml
RUN cd file-service && mvn dependency:go-offline -B

COPY file-service/src file-service/src

# Build the application
RUN cd file-service && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
# Set timezone to Asia/Ho_Chi_Minh (fix lệch giờ)
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && echo "Asia/Ho_Chi_Minh" > /etc/timezone \
    && apk del tzdata
# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring && \
    chown -R spring:spring /app
USER spring:spring

# Copy the JAR from build stage
COPY --from=build /app/file-service/target/*.jar app.jar

# Expose port
EXPOSE 8083

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8083/actuator/health || exit 1

# Run the application with optimized JVM settings for file handling
ENTRYPOINT ["java", \
    "-Xms512m", \
    "-Xmx1024m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-jar", "/app/app.jar"]
