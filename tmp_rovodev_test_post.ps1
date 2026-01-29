$body = @{
    update_id = 123456789
    message = @{
        message_id = 1
        from = @{
            id = 8311531873
            first_name = "Test"
        }
        chat = @{
            id = 8311531873
            type = "private"
        }
        date = [int](Get-Date -UFormat %s)
        text = "/start"
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "https://srilanka-37u2.vercel.app/api/telegram-webhook" -Method POST -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
