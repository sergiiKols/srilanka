$url = "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/getWebhookInfo"
$response = Invoke-RestMethod -Uri $url -Method Get
$response | ConvertTo-Json -Depth 10
