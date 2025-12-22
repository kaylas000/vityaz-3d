# PowerShell script to download REAL 3D models for VITYAZ
# Run from project root: .\download-models.ps1

$ErrorActionPreference = "Stop"

# Create directories
$dirs = @(
    "frontend/src/assets/models/soldiers",
    "frontend/src/assets/models/weapons",
    "frontend/src/assets/models/environment",
    "frontend/src/assets/models/props"
)

Write-Host "Creating directory structure..."
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created $dir"
    }
}

# Define REAL models from GitHub (ramjigeddam/3d, Mugen87/dive, and others)
$models = @(
    # SOLDIERS - from ramjigeddam/3d
    @{
        url = "https://raw.githubusercontent.com/ramjigeddam/3d/master/Soldier.glb"
        output = "frontend/src/assets/models/soldiers/soldier_main.glb"
        name = "Military Soldier"
    },
    @{
        url = "https://raw.githubusercontent.com/ramjigeddam/3d/master/Character_Type_1.glb"
        output = "frontend/src/assets/models/soldiers/character_type_1.glb"
        name = "Character Type 1"
    },
    # WEAPONS - from ramjigeddam/3d
    @{
        url = "https://raw.githubusercontent.com/ramjigeddam/3d/master/Photon_Knight.glb"
        output = "frontend/src/assets/models/props/photon_knight.glb"
        name = "Photon Knight (Sci-fi)"
    },
    # ENVIRONMENT - from ramjigeddam/3d
    @{
        url = "https://raw.githubusercontent.com/ramjigeddam/3d/master/house.glb"
        output = "frontend/src/assets/models/environment/house.glb"
        name = "House (Environment)"
    },
    # PROPS - ramjigeddam/3d
    @{
        url = "https://raw.githubusercontent.com/ramjigeddam/3d/master/Car.glb"
        output = "frontend/src/assets/models/props/car.glb"
        name = "Car"
    }
)

Write-Host "`nDownloading 3D models from GitHub..."
Write-Host "========================================"

$downloaded = 0
$failed = 0

foreach ($model in $models) {
    Write-Host "`n⬇ Downloading: $($model.name)"
    Write-Host "   Source: $($model.url.Split('/')[3])/$($model.url.Split('/')[4])"
    
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $model.url -OutFile $model.output -UseBasicParsing
        $size = (Get-Item $model.output).Length / 1MB
        Write-Host "   ✓ Success: $([math]::Round($size, 2)) MB"
        $downloaded++
    } catch {
        Write-Host "   ✗ Failed: $($_)"
        $failed++
    }
}

Write-Host "`n========================================"
Write-Host "Download Summary:"
Write-Host "  Downloaded: $downloaded models"
Write-Host "  Failed: $failed models"
Write-Host "========================================`n"

if ($downloaded -gt 0) {
    Write-Host "✓ Models ready for integration!"
    Write-Host "`nNext steps:"
    Write-Host "1. Verify models in: frontend/src/assets/models/"
    Write-Host "2. Commit: git add -A && git commit -m 'feat: Add downloaded 3D models from GitHub'"
    Write-Host "3. Push: git push origin graphics/ready-assets"
    Write-Host "4. Create Pull Request on GitHub"
}
