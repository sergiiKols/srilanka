# Real-time Parsing Monitor - Pass 2
# Monitors checkpoints and provides live statistics

Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         МОНИТОРИНГ ПАРСИНГА PASS 2 - РЕАЛЬНОЕ ВРЕМЯ              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Get latest checkpoint
$checkpointDir = "SRI/parsed_data/negombo_tangalle/checkpoints"
$latestCheckpoint = Get-ChildItem "$checkpointDir/pass_2_checkpoint_*.json" | 
    Sort-Object { [int]($_.Name -replace '.*checkpoint_(\d+)\.json','$1') } -Descending | 
    Select-Object -First 1

if (-not $latestCheckpoint) {
    Write-Host "⚠️  Чекпоинты не найдены" -ForegroundColor Red
    exit
}

# Load checkpoint data
$checkpointNumber = [int]($latestCheckpoint.Name -replace '.*checkpoint_(\d+)\.json','$1')
$data = Get-Content $latestCheckpoint.FullName -Raw | ConvertFrom-Json

# Calculate statistics
$totalPOIs = $data.Count
$locations = $data | Group-Object -Property location | Sort-Object Name
$categories = $data | Group-Object -Property category | Sort-Object Count -Descending
$lastLocation = $locations[-1].Name
$processedLocations = $locations.Count

# Time calculations
$firstPOI = $data[0]
$lastPOI = $data[-1]
$startTime = [DateTime]::Parse($firstPOI.createdAt)
$currentTime = [DateTime]::Parse($lastPOI.createdAt)
$elapsed = $currentTime - $startTime
$avgTimePerPOI = $elapsed.TotalSeconds / $totalPOIs
$poisPerHour = [math]::Round($totalPOIs / ($elapsed.TotalHours), 0)

# Estimate completion
$totalLocations = 29
$remainingLocations = $totalLocations - $processedLocations
$estimatedTotalPOIs = [math]::Round(($totalPOIs / $processedLocations) * $totalLocations, 0)
$remainingPOIs = $estimatedTotalPOIs - $totalPOIs
$remainingHours = [math]::Round($remainingPOIs / $poisPerHour, 1)

Write-Host "📊 ОБЩАЯ СТАТИСТИКА:" -ForegroundColor Yellow
Write-Host "   Чекпоинт: #$checkpointNumber" -ForegroundColor White
Write-Host "   Всего собрано: $totalPOIs POIs" -ForegroundColor Green
Write-Host "   Обработано локаций: $processedLocations / $totalLocations" -ForegroundColor White
Write-Host "   Прогресс: $([math]::Round($processedLocations/$totalLocations*100, 1))%" -ForegroundColor Yellow
Write-Host "   Последняя локация: $lastLocation" -ForegroundColor Cyan

Write-Host "`n⏱️  СКОРОСТЬ И ВРЕМЯ:" -ForegroundColor Yellow
Write-Host "   Время работы: $($elapsed.Hours)ч $($elapsed.Minutes)м" -ForegroundColor White
Write-Host "   Скорость: $poisPerHour POIs/час" -ForegroundColor Green
Write-Host "   Среднее время на POI: $([math]::Round($avgTimePerPOI, 1)) сек" -ForegroundColor White
Write-Host "   Оценка до завершения: ~$remainingHours часов" -ForegroundColor Yellow
Write-Host "   Ожидаемо всего: ~$estimatedTotalPOIs POIs" -ForegroundColor Cyan

Write-Host "`n📍 ОБРАБОТАННЫЕ ЛОКАЦИИ ($processedLocations):" -ForegroundColor Yellow
$locations | ForEach-Object {
    $percent = [math]::Round($_.Count / $totalPOIs * 100, 1)
    Write-Host "   $($_.Name.PadRight(25)): $($_.Count.ToString().PadLeft(4)) POIs ($percent%)" -ForegroundColor White
}

Write-Host "`n📂 КАТЕГОРИИ (топ-10):" -ForegroundColor Yellow
$categories | Select-Object -First 10 | ForEach-Object {
    $percent = [math]::Round($_.Count / $totalPOIs * 100, 1)
    Write-Host "   $($_.Name.PadRight(15)): $($_.Count.ToString().PadLeft(4)) POIs ($percent%)" -ForegroundColor White
}

Write-Host "`n📈 СРАВНЕНИЕ С PASS 1:" -ForegroundColor Yellow
$pass1Total = 2404
$currentRate = $totalPOIs / $processedLocations
$pass1Rate = $pass1Total / 30
$difference = [math]::Round((($currentRate - $pass1Rate) / $pass1Rate) * 100, 1)
Write-Host "   Pass 1: $pass1Rate POIs/локация (всего 2404 POIs)" -ForegroundColor Gray
Write-Host "   Pass 2: $([math]::Round($currentRate, 1)) POIs/локация (текущая)" -ForegroundColor White
if ($difference -gt 0) {
    Write-Host "   Разница: +$difference% больше POIs" -ForegroundColor Green
} else {
    Write-Host "   Разница: $difference% меньше POIs" -ForegroundColor Red
}

Write-Host "`n📁 ФАЙЛЫ:" -ForegroundColor Yellow
Write-Host "   Последний чекпоинт: $($latestCheckpoint.Name)" -ForegroundColor White
Write-Host "   Размер: $([math]::Round($latestCheckpoint.Length / 1KB, 0)) KB" -ForegroundColor White
Write-Host "   Обновлен: $($latestCheckpoint.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray

Write-Host "`n✅ ПРОЦЕСС АКТИВЕН" -ForegroundColor Green
Write-Host "   Используйте Ctrl+C для выхода из монитора`n" -ForegroundColor Gray
