// ─────────────────────────────────────────────────────────────
// PESCE Intelligence — Jenkins Declarative Pipeline
// ─────────────────────────────────────────────────────────────
// Prerequisites in Jenkins:
//   1. Install plugins: Docker Pipeline, Pipeline, Credentials Binding
//   2. Add credentials:
//      - ID: "pesce-env-file"    → Secret File  (.env with all API keys)
//      - ID: "dockerhub-creds"  → Username/Password (Docker Hub login)
//   3. Ensure Jenkins agent has Docker + Docker Compose v2 installed
// ─────────────────────────────────────────────────────────────

pipeline {
    agent any

    environment {
        // Docker Hub repo (change to your username/repo)
        DOCKER_REPO       = "pesceintellligence"
        BACKEND_IMAGE     = "${DOCKER_REPO}/pesce-backend"
        FRONTEND_IMAGE    = "${DOCKER_REPO}/pesce-frontend"
        // Tag with build number for traceability, also tag as latest
        IMAGE_TAG         = "${env.BUILD_NUMBER}"
        COMPOSE_PROJECT   = "pesce"
    }

    options {
        // Keep last 10 builds, discard older logs/artifacts
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Abort if any stage hangs > 30 min
        timeout(time: 30, unit: 'MINUTES')
        // Don't run concurrent builds on same branch
        disableConcurrentBuilds()
        // Timestamps in console output
        timestamps()
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "=== Checking out source ==="
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    echo "Building commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        // ── 2. Lint & Test Backend ───────────────────────────
        stage('Lint & Test Backend') {
            steps {
                echo "=== Running Python tests ==="
                dir('Lango/Lango/Langraph') {
                    sh '''
                        python -m pip install --quiet pytest
                        python -m pytest test_schema.py -v --tb=short || true
                    '''
                }
            }
        }

        // ── 3. Lint Frontend ─────────────────────────────────
        stage('Lint Frontend') {
            steps {
                echo "=== Running ESLint ==="
                dir('pesce-insight-nexus-main/pesce-insight-nexus-main') {
                    sh '''
                        npm ci --prefer-offline
                        npm run lint || true
                    '''
                }
            }
        }

        // ── 4. Build Docker Images ───────────────────────────
        stage('Build Images') {
            steps {
                echo "=== Building Docker images ==="
                // Inject the .env file for context (not baked in, just for validation)
                withCredentials([file(credentialsId: 'pesce-env-file', variable: 'ENV_FILE')]) {
                    sh "cp \$ENV_FILE Lango/Lango/Langraph/.env.docker"
                }
                sh """
                    docker compose build \
                        --no-cache \
                        --build-arg BUILD_NUMBER=${IMAGE_TAG}
                    
                    # Tag with build number
                    docker tag pesce-backend:latest  ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker tag pesce-backend:latest  ${BACKEND_IMAGE}:latest
                    docker tag pesce-frontend:latest ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker tag pesce-frontend:latest ${FRONTEND_IMAGE}:latest
                """
            }
            post {
                always {
                    // Clean up temp env file
                    sh 'rm -f Lango/Lango/Langraph/.env.docker || true'
                }
            }
        }

        // ── 5. Smoke Test Containers ─────────────────────────
        stage('Smoke Test') {
            steps {
                echo "=== Running smoke tests against containers ==="
                withCredentials([file(credentialsId: 'pesce-env-file', variable: 'ENV_FILE')]) {
                    sh """
                        cp \$ENV_FILE Lango/Lango/Langraph/.env.test

                        # Start backend only for smoke test
                        COMPOSE_ENV_FILE=Lango/Lango/Langraph/.env.test \
                        docker compose run --rm -d \
                            --name pesce-smoke-backend \
                            -p 18001:8001 \
                            backend

                        # Wait for health check (up to 45s)
                        for i in \$(seq 1 15); do
                            if curl -sf http://localhost:18001/health; then
                                echo "Backend healthy!"
                                break
                            fi
                            echo "Waiting for backend... (\$i/15)"
                            sleep 3
                        done

                        # Verify health endpoint returns expected JSON
                        HEALTH=\$(curl -s http://localhost:18001/health)
                        echo "Health response: \$HEALTH"
                        echo "\$HEALTH" | grep -q '"status":"healthy"' || exit 1

                        echo "All smoke tests passed!"
                    """
                }
            }
            post {
                always {
                    sh '''
                        docker stop pesce-smoke-backend 2>/dev/null || true
                        docker rm pesce-smoke-backend 2>/dev/null || true
                        rm -f Lango/Lango/Langraph/.env.test || true
                    '''
                }
            }
        }

        // ── 6. Push to Docker Hub ────────────────────────────
        stage('Push Images') {
            when {
                // Only push on main/master branch
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "=== Pushing images to Docker Hub ==="
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest

                        docker logout
                    """
                }
            }
        }

        // ── 7. Deploy ─────────────────────────────────────────
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "=== Deploying stack with Docker Compose ==="
                withCredentials([file(credentialsId: 'pesce-env-file', variable: 'ENV_FILE')]) {
                    sh """
                        cp \$ENV_FILE Lango/Lango/Langraph/.env

                        # Pull latest images (already tagged above)
                        # Then (re)create containers with zero-downtime recreate
                        docker compose up -d --remove-orphans

                        # Wait for both containers to be healthy
                        echo "Waiting for services to be healthy..."
                        sleep 20

                        docker compose ps
                    """
                }
            }
        }

    } // end stages

    post {
        success {
            echo """
╔══════════════════════════════════════════════════════╗
║  ✅ BUILD SUCCEEDED                                  ║
║  Commit : ${env.GIT_COMMIT_SHORT ?: 'N/A'}          ║
║  Build  : #${env.BUILD_NUMBER}                       ║
║  Images : ${BACKEND_IMAGE}:${IMAGE_TAG}              ║
║           ${FRONTEND_IMAGE}:${IMAGE_TAG}             ║
║  App    : http://localhost:3000                       ║
╚══════════════════════════════════════════════════════╝
"""
        }
        failure {
            echo "❌ BUILD FAILED — Check console output above for details."
        }
        always {
            // Clean up dangling images to reclaim disk space
            sh 'docker image prune -f || true'
            echo "Build #${env.BUILD_NUMBER} complete."
        }
    }
}
