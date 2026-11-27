FROM node:22-bookworm-slim AS client-build
WORKDIR /build/client
COPY client/package.json client/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY client/index.html client/vite.config.js client/tailwind.config.js ./
COPY client/public/ ./public/
COPY client/src/ ./src/
RUN npm run build

FROM eclipse-temurin:21-jdk-noble AS server-build
WORKDIR /build/server
COPY server/.mvn/ ./.mvn/
COPY server/mvnw server/pom.xml ./
COPY server/src/main/ ./src/main/
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -ntp -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre-noble AS runtime
WORKDIR /opt/knowledge-bay
RUN command -v curl \
    && groupadd --gid 10001 knowledge-bay \
    && useradd --uid 10001 --gid 10001 --no-create-home knowledge-bay \
    && install -d -m 0700 -o 10001 -g 10001 /var/lib/knowledge-bay/uploads
COPY --from=server-build /build/server/target/server-0.0.1-SNAPSHOT.jar ./server.jar
COPY --from=client-build /build/client/dist/ ./web/
ENV SPRING_PROFILES_ACTIVE=prod \
    SPRING_WEB_RESOURCES_STATIC_LOCATIONS=file:/opt/knowledge-bay/web/ \
    APP_UPLOADS_DIR=/var/lib/knowledge-bay/uploads
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/opt/knowledge-bay/server.jar"]
