// PESCE Intelligence -- Jenkins Declarative Pipeline
// Windows agent, Docker Desktop, Java 21
//
// CREDENTIALS (Manage Jenkins > Credentials > Global > Add Credential):
//   ID: pesce-env-file          Kind: Secret file  (Lango\Lango\Langraph\.env)
//   ID: pesce-frontend-env-file Kind: Secret file  (pesce-insight-nexus-main\..\.env)
//   ID: dockerhub-creds         Kind: Username+Password (Docker Hub, push only)

pipeline {
    agent any

    environment {
        WORKSPACE_DIR  = "d:\\games\\PES placement PWA"
        BACKEND_DIR    = "Lango\\Lango\\Langraph"
        FRONTEND_DIR   = "pesce-insight-nexus-main\\pesce-insight-nexus-main"
        BACKEND_IMAGE  = "pesce-backend"
        FRONTEND_IMAGE = "pesce-frontend"
        COMPOSE_FILE   = "docker-compose.yml"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Prepare') {
            steps {
                echo "=== Build #${BUILD_NUMBER} ==="
                bat """
                    if not exist "%WORKSPACE_DIR%\\Dockerfile.backend"  ( echo ERROR: Dockerfile.backend missing & exit /b 1 )
                    if not exist "%WORKSPACE_DIR%\\Dockerfile.frontend"  ( echo ERROR: Dockerfile.frontend missing & exit /b 1 )
                    if not exist "%WORKSPACE_DIR%\\docker-compose.yml"  ( echo ERROR: docker-compose.yml missing & exit /b 1 )
                    docker info > nul 2>&1 || ( echo ERROR: Docker not running & exit /b 1 )
                    echo All checks passed.
                """
            }
        }

        stage('Test Backend') {
            steps {
                bat """
                    cd /d "%WORKSPACE_DIR%\\%BACKEND_DIR%"
                    python -m pip install --quiet pytest
                    python -m pytest test_schema.py -v --tb=short
                """
            }
        }

        stage('Lint Frontend') {
            steps {
                bat """
                    cd /d "%WORKSPACE_DIR%\\%FRONTEND_DIR%"
                    npm install --prefer-offline
                    npx tsc --noEmit
                """
            }
        }

        stage('Build Images') {
            steps {
                echo "=== Building Docker images ==="
                withCredentials([
                    file(credentialsId: 'pesce-env-file',          variable: 'BACKEND_ENV'),
                    file(credentialsId: 'pesce-frontend-env-file', variable: 'FRONTEND_ENV')
                ]) {
                    // Copy backend secrets
                    bat "copy /Y \"%BACKEND_ENV%\" \"%WORKSPACE_DIR%\\%BACKEND_DIR%\\.env\""

                    // Write a .bat that embeds VITE_ build args and calls docker compose
                    // Using [IO.File]::WriteAllText avoids PowerShell exit-code swallowing
                    powershell """
                        \$lines = Get-Content "\$env:FRONTEND_ENV" | Where-Object { \$_ -match '^VITE_' -and \$_.Trim() -ne '' -and \$_ -notmatch '^#' }
                        \$argStr = (\$lines | ForEach-Object { \$p = \$_ -split '=',2; "--build-arg " + \$p[0].Trim() + "=" + \$p[1].Trim() }) -join " "
                        \$content = "@echo off`r`ncd /d `"\$env:WORKSPACE_DIR`"`r`ndocker compose -f \$env:COMPOSE_FILE build --no-cache \$argStr`r`nexit /b %ERRORLEVEL%`r`n"
                        [IO.File]::WriteAllText("\$env:WORKSPACE_DIR\run-build.bat", \$content, [Text.Encoding]::ASCII)
                        Write-Host "Generated run-build.bat with args: \$argStr"
                    """
                }
                // Execute the generated bat -- Jenkins sees the real exit code
                bat "\"%WORKSPACE_DIR%\\run-build.bat\""
            }
            post {
                always {
                    bat "if exist \"%WORKSPACE_DIR%\\%BACKEND_DIR%\\.env\" del /F /Q \"%WORKSPACE_DIR%\\%BACKEND_DIR%\\.env\""
                    bat "if exist \"%WORKSPACE_DIR%\\run-build.bat\" del /F /Q \"%WORKSPACE_DIR%\\run-build.bat\""
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withCredentials([file(credentialsId: 'pesce-env-file', variable: 'BACKEND_ENV')]) {
                    bat "copy /Y \"%BACKEND_ENV%\" \"%WORKSPACE_DIR%\\%BACKEND_DIR%\\.env\""
                }
                bat """
                    cd /d "%WORKSPACE_DIR%"
                    docker run --rm -d --name pesce-smoke-%BUILD_NUMBER% --env-file %BACKEND_DIR%\\.env -p 18001:8001 pesce-backend:latest
                """
                powershell """
                    \$ok = \$false
                    for (\$i=1; \$i -le 15; \$i++) {
                        try { \$r = Invoke-WebRequest 'http://localhost:18001/health' -UseBasicParsing -TimeoutSec 3; if (\$r.StatusCode -eq 200) { \$ok = \$true; break } } catch {}
                        Write-Host "Waiting (\$i/15)..."; Start-Sleep 3
                    }
                    if (-not \$ok) { Write-Error 'Health check timed out'; exit 1 }
                    if (\$r.Content -notmatch '"status":"healthy"') { Write-Error 'Bad health response'; exit 1 }
                    Write-Host "Smoke test PASSED: \$(\$r.Content)"
                """
            }
            post {
                always {
                    bat "docker stop pesce-smoke-%BUILD_NUMBER% 2>nul & docker rm pesce-smoke-%BUILD_NUMBER% 2>nul & exit /b 0"
                    bat "if exist \"%WORKSPACE_DIR%\\%BACKEND_DIR%\\.env\" del /F /Q \"%WORKSPACE_DIR%\\%BACKEND_DIR%\\.env\""
                }
            }
        }

        stage('Push Images') {
            when { anyOf { branch 'main'; branch 'master' } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    bat """
                        echo %DH_PASS% | docker login -u %DH_USER% --password-stdin
                        docker tag pesce-backend:latest  %DH_USER%/pesce-backend:%BUILD_NUMBER%
                        docker tag pesce-backend:latest  %DH_USER%/pesce-backend:latest
                        docker tag pesce-frontend:latest %DH_USER%/pesce-frontend:%BUILD_NUMBER%
                        docker tag pesce-frontend:latest %DH_USER%/pesce-frontend:latest
                        docker push %DH_USER%/pesce-backend:%BUILD_NUMBER%
                        docker push %DH_USER%/pesce-backend:latest
                        docker push %DH_USER%/pesce-frontend:%BUILD_NUMBER%
                        docker push %DH_USER%/pesce-frontend:latest
                        docker logout
                    """
                }
            }
        }

        stage('Deploy') {
            when { anyOf { branch 'main'; branch 'master' } }
            steps {
                withCredentials([file(credentialsId: 'pesce-env-file', variable: 'BACKEND_ENV')]) {
                    bat "copy /Y \"%BACKEND_ENV%\" \"%WORKSPACE_DIR%\\%BACKEND_DIR%\\.env\""
                }
                bat """
                    cd /d "%WORKSPACE_DIR%"
                    docker compose -f %COMPOSE_FILE% up -d --remove-orphans --no-build
                    timeout /t 15 /nobreak > nul
                    docker compose -f %COMPOSE_FILE% ps
                """
            }
        }

    }

    post {
        success { echo "BUILD #${BUILD_NUMBER} SUCCEEDED -- App: http://localhost:3000" }
        failure { echo "BUILD #${BUILD_NUMBER} FAILED -- check stage logs above." }
        always  { bat "docker image prune -f 2>nul & exit /b 0" }
    }
}
