# Weekly automatic backup script for .ziggy repository
# We check $LASTEXITCODE for external commands rather than using global ErrorActionPreference = "Stop"

# Log file path
$LogFile = "C:\Users\richm\OneDrive\Desktop\.ziggy\backup_log.txt"

function Log-Message {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogLine = "[$Timestamp] $Message"
    Write-Output $LogLine
    Add-Content -Path $LogFile -Value $LogLine
}

Log-Message "Starting weekly backup..."

# Temporarily clear GITHUB_TOKEN environment variable to ensure use of keyring/credential manager
if ($env:GITHUB_TOKEN) {
    Log-Message "Clearing GITHUB_TOKEN env var for this session..."
    $env:GITHUB_TOKEN = $null
}

# Change directory to .ziggy
Set-Location -Path "C:\Users\richm\OneDrive\Desktop\.ziggy"

# Check git status
$Status = git status --porcelain
if (-not $Status) {
    Log-Message "No changes to back up."
    exit 0
}

Log-Message "Changes detected. Staging changes..."
git add .
if ($LASTEXITCODE -ne 0) {
    Log-Message "Error: 'git add' failed with exit code $LASTEXITCODE"
    exit 1
}

$DateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Log-Message "Committing changes..."
git commit -m "Weekly automatic backup: $DateStr"
if ($LASTEXITCODE -ne 0) {
    Log-Message "Error: 'git commit' failed with exit code $LASTEXITCODE"
    exit 1
}

Log-Message "Pushing to GitHub..."
$PushOutput = git push origin main 2>&1
$PushExitCode = $LASTEXITCODE

# Convert push output to a single string for logging
$PushOutputStr = [string]::Join("`n", $PushOutput)
Log-Message "Push Output:`n$PushOutputStr"

if ($PushExitCode -ne 0) {
    Log-Message "Backup failed: 'git push' exited with code $PushExitCode"
    exit 1
}

Log-Message "Backup completed successfully!"
exit 0
