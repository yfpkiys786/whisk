# Whisk API Startup Script
# Set proxy
$env:HTTP_PROXY="http://127.0.0.1:19401"
$env:HTTPS_PROXY="http://127.0.0.1:19401"

# Show help info
Write-Host "Whisk API Started!" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  whisk generate -c 'cookie' -p 'prompt'    # Generate image"
Write-Host "  whisk animate <mediaId> -c 'cookie' -s 'desc'  # Generate video"
Write-Host "  whisk --help                              # Show all commands"
Write-Host ""
Write-Host "Note: Replace 'cookie' with your Google Cookie"
Write-Host ""

# Show help
whisk --help