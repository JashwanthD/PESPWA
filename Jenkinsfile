// ─────────────────────────────────────────────────────────────
// PESCE Intelligence — Jenkins Declarative Pipeline (Windows)
// ─────────────────────────────────────────────────────────────
// Prerequisites in Jenkins:
//   1. Install plugins: Docker Pipeline, Pipeline, Credentials Binding
//   2. Add credentials:
//      - ID: "pesce-env-file"    → Secret File  (.env with all API keys)
//      - ID: "dockerhub-creds"  → Username/Password (Docker Hub login)
//   3. Ensure Jenkins agent has Docker + Docker Compose v2 installed
//   4. Jenkins running on Windows — uses 'bat' / 'powershell' (NOT 'sh')
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
                    env.GIT_COMMIT_SHORT = bat(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim().readLines().last()
                    echo "Building commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        // ── 2. Lint & Test Backend ───────────────────────────
        stage('Lint & Test Backend') {
            steps {
                echo "=== Running Python tests ==="
                dir('Lango/Lango/Langraph') {
                    bat '''
                        python -m pip install --quiet pytest
                        python -m pytest test_schema.py -v --tb=short
                        exit /b 0
                    '''
                }
            }
        }

        // ── 3. Lint Frontend ─────────────────────────────────
        stage('Lint Frontend') {
            steps {
                echo "=== Running ESLint ==="
                dir('pesce-insight-nexus-main/pesce-insight-nexus-main') {
                    bat '''
                        npm ci --prefer-offline
                        npm run lint
                        exit /b 0
                    '''
                }
            }
        }

        // ── 4. Build Docker Images ───────────────────────────
        stage('Build Images') {
            steps {
                echo "=== Building Docker images ==="
                withCredentials([file(credentialsId: 'pesce-env-file', variable: 'ENV_FILE')]) {
                    powershell '''
                        Copy-Item $env:ENV_FILE -Destination "Lango\\Lango\\Langraph\\.env.docker" -Force
                    '''
                }
                bat """
                    docker compose build --no-cache --build-arg BUILD_NUMBER=%IMAGE_TAG%

                    docker tag pesce-backend:latest  %BACKEND_IMAGE%:%IMAGE_TAG%
                    docker tag pesce-backend:latest  %BACKEND_IMAGE%:latest
                    docker tag pesce-frontend:latest %FRONTEND_IMAGE%:%IMAGE_TAG%
                    docker tag pesce-frontend:latest %FRONTEND_IMAGE%:latest
                """
            }
            post {
                always {
                    powershell '''
                        Remove-Item -Path "Lango\\Lango\\Langraph\\.env.docker" -Force -ErrorAction SilentlyContinue
                    '''
                }
            }
        }

        // ── 5. Smoke Test Containers ─────────────────────────
        stage('Smoke Test') {
            steps {
                echo "=== Running smoke tests against containers ==="
                withCredentials([file(credentialsId: 'pesce-env-file', variable: 'ENV_FILE')]) {
                    powershell '''
                        Copy-Item $env:ENV_FILE -Destination "Lango\\Lango\\Langraph\\.env.test" -Force

                        # Start backend only for smoke test
                        docker compose run --rm -d `
                            --name pesce-smoke-backend `
                            -p 18001:8001 `
                            backend

                        # Wait for health check (up to 45s)
                        $healthy = $false
                        for ($i = 1; $i -le 15; $i++) {
                            try {
                                $resp = Invoke-WebRequest -Uri "http://localhost:18001/health" -UseBasicParsing -TimeoutSec 3
                                if ($resp.StatusCode -eq 200) {
                                    Write-Host "Backend healthy!"
                                    $healthy = $true
                                    break
                                }
                            } catch {
                                Write-Host "Waiting for backend... ($i/15)"
                                Start-Sleep -Seconds 3
                            }
                        }

                        if (-not $healthy) {
                            Write-Host "Backend did not become healthy in time!"
                            exit 1
                        }

                        # Verify health endpoint returns expected JSON
                        $health = (Invoke-WebRequest -Uri "http://localhost:18001/health" -UseBasicParsing).Content
                        Write-Host "Health response: $health"
                        if ($health -notmatch '"status":"healthy"') {
                            Write-Host "Health check response invalid!"
                            exit 1
                        }

                        Write-Host "All smoke tests passed!"
                    '''
                }
            }
            post {
                always {
                    powershell '''
                        docker stop pesce-smoke-backend 2>$null
                        docker rm   pesce-smoke-backend 2>$null
                        Remove-Item -Path "Lango\\Lango\\Langraph\\.env.test" -Force -ErrorAction SilentlyContinue
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
                    powershell '''
                        $env:DOCKER_PASS | docker login -u $env:DOCKER_USER --password-stdin

                        docker push "$env:BACKEND_IMAGE`:$env:IMAGE_TAG"
                        docker push "$env:BACKEND_IMAGE`:latest"
                        docker push "$env:FRONTEND_IMAGE`:$env:IMAGE_TAG"
                        docker push "$env:FRONTEND_IMAGE`:latest"

                        docker logout
                    '''
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
                    powershell '''
                        Copy-Item $env:ENV_FILE -Destination "Lango\\Lango\\Langraph\\.env" -Force

                        # (Re)create containers with latest images
                        docker compose up -d --remove-orphans

                        # Wait for services to stabilise
                        Write-Host "Waiting for services to be healthy..."
                        Start-Sleep -Seconds 20

                        docker compose ps
                    '''
                }
            }
        }

    } // end stages

    post {
        success {
            echo """
╔══════════════════════════════════════════════════════╗
║  BUILD SUCCEEDED                                     ║
║  Commit : ${env.GIT_COMMIT_SHORT ?: 'N/A'}          ║
║  Build  : #${env.BUILD_NUMBER}                       ║
║  Images : ${BACKEND_IMAGE}:${IMAGE_TAG}              ║
║           ${FRONTEND_IMAGE}:${IMAGE_TAG}             ║
║  App    : http://localhost:3000                       ║
╚══════════════════════════════════════════════════════╝
"""
        }
        failure {
            echo "BUILD FAILED — Check console output above for details."
        }
        always {
            // Clean up dangling images to reclaim disk space
            bat 'docker image prune -f'
            echo "Build #${env.BUILD_NUMBER} complete."
        }
    }
}
