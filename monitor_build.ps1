$user = if ($env:JENKINS_USER) { $env:JENKINS_USER } else { "jashwanthd" }
$pass = $env:JENKINS_PASS
if (-not $pass) {
    $pass = Read-Host -Prompt "Enter Jenkins Password"
}
if (-not $pass) {
    Write-Error "Please set JENKINS_USER and JENKINS_PASS environment variables or enter the password."
    exit 1
}
$sec = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes(($user + ":" + $pass)))
$headers = @{ Authorization = "Basic $sec" }
$logFile = "d:\games\PES placement PWA\build_execution.log"
$ProgressPreference = 'SilentlyContinue'

function Log-Msg($msg) {
    Write-Output $msg
    Add-Content -Path $logFile -Value $msg
}

if (Test-Path $logFile) { Remove-Item $logFile }

try {
    # 1. Fetch Crumb
    Log-Msg "Fetching Jenkins crumb..."
    $crumbResp = Invoke-RestMethod -Uri "http://localhost:8080/crumbIssuer/api/json" -Method Get -Headers $headers -SessionVariable jenkinsSession
    $crumbHeaderName = $crumbResp.crumbRequestField
    $crumbValue = $crumbResp.crumb
    Log-Msg "Got crumb: $crumbValue"
    $headers.Add($crumbHeaderName, $crumbValue)

    # 2. Get Build Number
    $buildNumber = 26
    Log-Msg "Monitoring Build #$buildNumber..."

    # 3. Poll Build Status
    $building = $true
    $lastLineIndex = 0
    
    while ($building) {
        $buildStatus = Invoke-RestMethod -Uri "http://localhost:8080/job/TGL/$buildNumber/api/json" -Method Get -Headers $headers -WebSession $jenkinsSession
        $building = $buildStatus.building
        
        # Print progressive console output
        try {
            $respHeaders = $null
            $consoleText = Invoke-RestMethod -Uri "http://localhost:8080/job/TGL/$buildNumber/logText/progressiveText?start=$lastLineIndex" -Method Get -Headers $headers -WebSession $jenkinsSession -ResponseHeadersVariable respHeaders
            if ($consoleText) {
                Log-Msg $consoleText
            }
            if ($respHeaders -and $respHeaders["X-Text-Size"]) {
                $lastLineIndex = [int]$respHeaders["X-Text-Size"][0]
            }
        } catch {
            # LogText API might fail temporarily
        }
        
        if ($building) {
            Start-Sleep -Seconds 5
        }
    }

    # 4. Fetch Final Result
    $finalStatus = Invoke-RestMethod -Uri "http://localhost:8080/job/TGL/$buildNumber/api/json" -Method Get -Headers $headers -WebSession $jenkinsSession
    Log-Msg "=========================================="
    Log-Msg "Build Finished with Result: $($finalStatus.result)"
    Log-Msg "=========================================="
    
    if ($finalStatus.result -ne "SUCCESS") {
        exit 1
    } else {
        exit 0
    }
} catch {
    Log-Msg "Exception occurred: $_"
    if ($_.Exception -and $_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Log-Msg "Error details: $responseBody"
    }
    exit 1
}
