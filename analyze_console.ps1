$txt = Get-Content "d:\games\PES placement PWA\jenkins_console.txt" -Raw
# Strip ANSI escape sequences and Jenkins annotations
$cleanTxt = $txt -replace '\e\[[0-9;]*[a-zA-Z]', ''
$cleanTxt = $cleanTxt -replace 'ha:////[A-Za-z0-9+/=]+', ''

# Search for docker commands and login/push results
$lines = $cleanTxt -split "`n"
Write-Output "Matching lines for 'docker':"
$lines | Where-Object { $_ -match 'docker' -or $_ -match 'login' -or $_ -match 'push' } | Select-Object -First 50
