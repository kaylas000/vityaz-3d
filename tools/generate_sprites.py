#!/usr/bin/env python3
"""
AI Sprite Generator для VITYAZ: Special Operations
Генерирует профессиональные спрайты через Stable Diffusion

Usage:
    python3 generate_sprites.py

Requirements:
    pip install torch diffusers transformers accelerate pillow
"""

import os
import sys
from pathlib import Path

try:
    import torch
    from diffusers import StableDiffusionPipeline
    from PIL import Image
except ImportError:
    print("❌ Требуется установка зависимостей:")
    print("   pip install torch diffusers transformers accelerate pillow")
    sys.exit(1)

class VityazSpriteGenerator:
    """Генератор спрайтов для Витязь с использованием Stable Diffusion"""
    
    def __init__(self, output_dir: str = "frontend/src/assets/graphics/sprites"):
        self.output_dir = Path(output_dir)
        self.temp_dir = Path("frontend/src/assets/generated-temp")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipe = None
        self.generated_count = 0
        
        # Создать директории
        (self.output_dir / "characters").mkdir(parents=True, exist_ok=True)
        (self.output_dir / "weapons").mkdir(parents=True, exist_ok=True)
        (self.output_dir / "effects").mkdir(parents=True, exist_ok=True)
        (self.output_dir / "ui").mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"🎨 VITYAZ AI Sprite Generator")
        print(f"📁 Output: {self.output_dir}")
        print(f"🖥️  Device: {self.device}")
    
    def initialize_model(self):
        """Инициализация Stable Diffusion"""
        print("\n⚙️  Загрузка Stable Diffusion v1.5...")
        print("   (Первый запуск: ~2GB скачивания)")
        
        model_id = "runwayml/stable-diffusion-v1-5"
        
        try:
            self.pipe = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            self.pipe = self.pipe.to(self.device)
            
            # Оптимизация памяти
            if self.device == "cuda":
                self.pipe.enable_attention_slicing()
            
            print("✅ Модель загружена успешно\n")
        except Exception as e:
            print(f"❌ Ошибка загрузки модели: {e}")
            sys.exit(1)
    
    def get_prompts(self):
        """Оптимизированные промпты для каждого спрайта"""
        return {
            # ПЕРСОНАЖИ
            "characters/player_idle": {
                "prompt": """Russian Vityaz special forces operator standing alert, 
                maroon crimson beret on LEFT side of head, dark green tactical camouflage uniform, 
                military vest with equipment, professional soldier, combat boots,
                top-down 2D game view, pixel art style, simple but detailed,
                clean edges, vibrant colors, game sprite""",
                "size": (512, 512),
                "resize": (64, 64),
                "negative": "blurry, low quality, distorted, realistic photo, 3d render"
            },
            
            "characters/player_walk_down": {
                "prompt": """Vityaz soldier walking forward motion, maroon beret left side,
                green tactical uniform, legs in walking pose, arms swinging,
                top-down view, pixel art game sprite, motion frame, clean design""",
                "size": (512, 512),
                "resize": (64, 64),
                "negative": "static, standing, blurry, low quality"
            },
            
            "characters/player_walk_up": {
                "prompt": """Vityaz soldier walking away upward, maroon beret visible,
                green uniform, walking motion from behind, top-down pixel art sprite""",
                "size": (512, 512),
                "resize": (64, 64),
                "negative": "blurry, low quality, facing forward"
            },
            
            "characters/enemy_basic": {
                "prompt": """Hostile red military soldier, aggressive stance, gray combat helmet,
                red crimson colored uniform, tactical gear, enemy character,
                top-down view, pixel art game sprite, clear distinct design""",
                "size": (512, 512),
                "resize": (56, 56),
                "negative": "friendly, green uniform, blurry, low quality"
            },
            
            "characters/enemy_armed": {
                "prompt": """Red soldier holding rifle weapon, combat pose, gray helmet,
                red military uniform, armed enemy, aggressive posture,
                top-down pixel art sprite, game enemy character""",
                "size": (512, 512),
                "resize": (56, 56),
                "negative": "unarmed, friendly, blurry"
            },
            
            "characters/enemy_heavy": {
                "prompt": """Heavy armored enemy soldier, thick metal body armor plating,
                large intimidating build, machine gun weapon, gray brown armor,
                menacing boss character, top-down pixel art, detailed armor""",
                "size": (512, 512),
                "resize": (64, 64),
                "negative": "small, weak, light armor, blurry"
            },
            
            # ОРУЖИЕ
            "weapons/ak74m": {
                "prompt": """AK-74M assault rifle weapon sprite, wooden light brown stock,
                dark metal barrel and receiver, muzzle brake, military design,
                side view profile, pixel art weapon, clean edges, game asset""",
                "size": (512, 128),
                "resize": (48, 12),
                "negative": "blurry, distorted, modern rifle, AR-15"
            },
            
            "weapons/svd": {
                "prompt": """SVD Dragunov sniper rifle, long precision barrel, wooden furniture,
                scope mounting rails, professional sniper weapon, side view,
                pixel art sprite, detailed but simple, military green brown""",
                "size": (512, 128),
                "resize": (56, 14),
                "negative": "short barrel, assault rifle, blurry"
            },
            
            "weapons/rpk74": {
                "prompt": """RPK-74 light machine gun, heavy barrel, bipod legs,
                large ammunition capacity, light brown wood stock,
                side view weapon sprite, pixel art, military design""",
                "size": (512, 128),
                "resize": (56, 14),
                "negative": "pistol, small weapon, blurry"
            },
            
            "weapons/pmm": {
                "prompt": """Makarov PMM pistol, compact Soviet handgun, dark metal slide,
                small sidearm, side profile view, pixel art weapon sprite,
                simple clean design, military sidearm""",
                "size": (512, 128),
                "resize": (32, 10),
                "negative": "large, rifle, blurry, modern pistol"
            },
        }
    
    def generate_sprite(self, name: str, config: dict):
        """Генерация одного спрайта"""
        print(f"🎨 Генерирую: {name}...")
        
        try:
            with torch.no_grad():
                # Генерация изображения
                result = self.pipe(
                    prompt=config["prompt"],
                    negative_prompt=config.get("negative", ""),
                    num_inference_steps=50,
                    guidance_scale=7.5,
                    height=config["size"][1],
                    width=config["size"][0]
                )
                
                image = result.images[0]
                
                # Сохранить полноразмерный вариант во временную папку
                temp_path = self.temp_dir / f"{name.replace('/', '_')}_full.png"
                image.save(temp_path)
                print(f"   ✓ Полный размер: {temp_path}")
                
                # Уменьшить до финального размера
                resize = config.get("resize", (64, 64))
                image_resized = image.resize(resize, Image.Resampling.LANCZOS)
                
                # Сохранить финальный спрайт
                final_path = self.output_dir / f"{name}.png"
                final_path.parent.mkdir(parents=True, exist_ok=True)
                image_resized.save(final_path, optimize=True)
                
                file_size = final_path.stat().st_size / 1024
                print(f"   ✅ {name}.png ({resize[0]}x{resize[1]}, {file_size:.1f}KB)")
                
                self.generated_count += 1
                return True
                
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            return False
    
    def generate_all(self):
        """Генерация всех спрайтов"""
        prompts = self.get_prompts()
        total = len(prompts)
        
        print(f"\n🚀 Начинаю генерацию {total} спрайтов...\n")
        
        for i, (name, config) in enumerate(prompts.items(), 1):
            print(f"[{i}/{total}] ", end="")
            self.generate_sprite(name, config)
            print()  # Пустая строка между спрайтами
        
        print(f"\n✅ Генерация завершена!")
        print(f"   Успешно: {self.generated_count}/{total}")
        print(f"   Спрайты: {self.output_dir}")
        print(f"   Полные: {self.temp_dir}")
        
    def create_index(self):
        """Создать индексный файл со списком спрайтов"""
        index_path = self.output_dir / "sprites_index.json"
        
        import json
        
        index = {
            "generated": str(self.generated_count),
            "characters": [
                "player_idle.png",
                "player_walk_down.png", 
                "player_walk_up.png",
                "enemy_basic.png",
                "enemy_armed.png",
                "enemy_heavy.png"
            ],
            "weapons": [
                "ak74m.png",
                "svd.png",
                "rpk74m.png",
                "pmm.png"
            ]
        }
        
        with open(index_path, 'w') as f:
            json.dump(index, f, indent=2)
        
        print(f"\n📋 Индекс создан: {index_path}")

def main():
    """Главная функция"""
    print("=" * 60)
    print("  VITYAZ: Special Operations - AI Sprite Generator")
    print("=" * 60)
    
    generator = VityazSpriteGenerator()
    
    # Инициализировать модель
    generator.initialize_model()
    
    # Генерировать все спрайты
    generator.generate_all()
    
    # Создать индекс
    generator.create_index()
    
    print("\n" + "=" * 60)
    print("  ✅ ВСЁ ГОТОВО!")
    print("=" * 60)
    print("\nСледующие шаги:")
    print("1. Проверить спрайты в frontend/src/assets/graphics/sprites/")
    print("2. Отредактировать в GIMP (опционально)")
    print("3. Интегрировать в код (см. docs/SPRITE_INTEGRATION.md)")
    print()

if __name__ == "__main__":
    main()
