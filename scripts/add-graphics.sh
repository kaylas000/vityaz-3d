#!/bin/bash

# VITYAZ Graphics Setup Helper
# Helps download and integrate free game assets

set -e

echo "🎨 VITYAZ Graphics Setup"
echo "========================"
echo ""

echo "This script will help you add graphics to the game."
echo ""
echo "Options:"
echo "  1. Download free pixel art assets"
echo "  2. Use placeholder graphics (colored rectangles)"
echo "  3. I have my own assets"
echo ""
read -p "Choose option (1-3): " option

case $option in
    1)
        echo ""
        echo "📥 Downloading free assets from OpenGameArt.org"
        mkdir -p frontend/public/assets/sprites
        mkdir -p frontend/public/assets/maps
        mkdir -p frontend/public/assets/ui
        
        echo "Recommended free asset packs:"
        echo "  1. Pixel Platformer: https://opengameart.org/content/platformer-art-deluxe"
        echo "  2. Top-down shooter: https://opengameart.org/content/top-down-shooter-sprites"
        echo "  3. UI Pack: https://opengameart.org/content/ui-pack"
        echo ""
        echo "Please download and place assets in:"
        echo "  frontend/public/assets/sprites/"
        echo "  frontend/public/assets/maps/"
        echo "  frontend/public/assets/ui/"
        ;;
    2)
        echo ""
        echo "🎨 Creating placeholder graphics"
        mkdir -p frontend/public/assets/sprites
        mkdir -p frontend/public/assets/maps
        
        # Create simple placeholder script
        cat > frontend/create-placeholders.js << 'EOF'
const { createCanvas } = require('canvas');
const fs = require('fs');

// Create player sprite (green rectangle)
const playerCanvas = createCanvas(32, 64);
const playerCtx = playerCanvas.getContext('2d');
playerCtx.fillStyle = '#00FF00';
playerCtx.fillRect(0, 0, 32, 64);
fs.writeFileSync('public/assets/sprites/player.png', playerCanvas.toBuffer());

// Create enemy sprite (red rectangle)
const enemyCanvas = createCanvas(32, 64);
const enemyCtx = enemyCanvas.getContext('2d');
enemyCtx.fillStyle = '#FF0000';
enemyCtx.fillRect(0, 0, 32, 64);
fs.writeFileSync('public/assets/sprites/enemy.png', enemyCanvas.toBuffer());

// Create background (gray grid)
const bgCanvas = createCanvas(1024, 768);
const bgCtx = bgCanvas.getContext('2d');
bgCtx.fillStyle = '#333333';
bgCtx.fillRect(0, 0, 1024, 768);
bgCtx.strokeStyle = '#444444';
for (let i = 0; i < 1024; i += 64) {
  bgCtx.beginPath();
  bgCtx.moveTo(i, 0);
  bgCtx.lineTo(i, 768);
  bgCtx.stroke();
}
for (let i = 0; i < 768; i += 64) {
  bgCtx.beginPath();
  bgCtx.moveTo(0, i);
  bgCtx.lineTo(1024, i);
  bgCtx.stroke();
}
fs.writeFileSync('public/assets/maps/default.png', bgCanvas.toBuffer());

console.log('✅ Placeholder graphics created!');
EOF
        
        cd frontend
        npm install canvas
        node create-placeholders.js
        cd ..
        
        echo "✅ Placeholder graphics created"
        ;;
    3)
        echo ""
        echo "📁 Please place your assets in:"
        echo "  frontend/public/assets/sprites/player.png"
        echo "  frontend/public/assets/sprites/enemy.png"
        echo "  frontend/public/assets/maps/default.png"
        echo "  frontend/public/assets/ui/"
        ;;
esac

echo ""
echo "✅ Graphics setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update BattleScene.ts with asset paths"
echo "  2. Test rendering: cd frontend && npm run dev"
echo "  3. Verify all sprites load correctly"
echo ""