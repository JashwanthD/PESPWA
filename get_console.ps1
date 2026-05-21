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
$ProgressPreference = 'SilentlyContinue'

try {
    # Auto-detect latest build number
    $jobInfo = Invoke-RestMethod -Uri "http://localhost:8080/job/TGL/api/json" -Method Get -Headers $headers
    $buildNum = $jobInfo.lastBuild.number
    Write-Output "Fetching console for build #$buildNum..."
    $consoleText = Invoke-RestMethod -Uri ("http://localhost:8080/job/TGL/" + $buildNum + "/logText/progressiveText?start=0") -Method Get -Headers $headers
    [System.IO.File]::WriteAllText("d:\games\PES placement PWA\jenkins_console.txt", $consoleText)
    Write-Output "Successfully wrote console text for build #$buildNum to jenkins_console.txt"
} catch {
    Write-Error "Error: $_"
}
