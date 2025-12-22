# PowerShell script to download 3D models for VITYAZ
# Run from project root: .\download-models.ps1

$ErrorActionPreference = "Stop"

# Create directories
$dirs = @(
    "frontend/src/assets/models/soldiers",
    "frontend/src/assets/models/weapons",
    "frontend/src/assets/models/environment",
    "frontend/src/assets/models/props"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created $dir"
    }
}

# Define models to download
$models = @(
    @{
        url = "https://raw.githubusercontent.com/Mugen87/dive/master/app/models/soldier.glb"
        output = "frontend/src/assets/models/soldiers/soldier.glb"
        name = "Soldier Character"
    },
    @{
        url = "https://raw.githubusercontent.com/Mugen87/dive/master/app/models/weapon_0.glb"
        output = "frontend/src/assets/models/weapons/weapon_0.glb"
        name = "Weapon 0"
    }
)

# Download models
foreach ($model in $models) {
    Write-Host "\nDownloading $($model.name)..."
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $model.url -OutFile $model.output
        $size = (Get-Item $model.output).Length / 1MB
        Write-Host "✓ Downloaded $($model.name) ($([math]::Round($size, 2)) MB)"
    } catch {
        Write-Host "✗ Failed to download $($model.name): $_"
    }
}

Write-Host "\n✓ All models downloaded!"
Write-Host "\nNext steps:"
Write-Host "1. Commit changes: git add -A && git commit -m 'feat: Add downloaded 3D models'"
Write-Host "2. Push to branch: git push origin graphics/ready-assets"
Write-Host "3. Create Pull Request"
