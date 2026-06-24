# Weekly automatic backup script for .ziggy repository
$ErrorActionPreference = "Stop"

# Log file path
$LogFile = "C:\Users\richm\OneDrive\Desktop\.ziggy\backup_log.txt"

function Log-Message {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogLine = "[$Timestamp] $Message"
    Write-Output $LogLine
    Add-Content -Path $LogFile -Value $LogLine
}

try {
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
    
    $DateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Log-Message "Committing changes..."
    git commit -m "Weekly automatic backup: $DateStr"
    
    Log-Message "Pushing to GitHub..."
    # Execute push and capture both stdout and stderr
    $PushOutput = git push origin main 2>&1
    Log-Message "Push Output: $PushOutput"
    
    Log-Message "Backup completed successfully!"
} catch {
    Log-Message "Backup failed: $_"
    exit 1
}
