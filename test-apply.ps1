# Test script for apply functionality
Write-Host "Testing apply functionality..."

# Test 1: Check if backend is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/job-offers" -Method GET
    Write-Host "Backend is running. Job offers count: $($response.Length)"
} catch {
    Write-Host "Backend is not running. Error: $($_.Exception.Message)"
    exit 1
}

# Test 2: Test apply endpoint
try {
    $applyBody = @{
        seekerId = 4
        jobOfferId = 1
    } | ConvertTo-Json
    
    $applyResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/applications/apply?seekerId=4&jobOfferId=1" -Method POST -Body $applyBody -ContentType "application/json"
    Write-Host "Apply successful: $($applyResponse | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "Apply failed. Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}

# Test 3: Check applications for seeker
try {
    $applications = Invoke-RestMethod -Uri "http://localhost:8080/api/applications/seeker/4" -Method GET
    Write-Host "Applications for seeker 4: $($applications.Length)"
    $applications | ConvertTo-Json -Depth 2
} catch {
    Write-Host "Failed to get applications. Error: $($_.Exception.Message)"
}
