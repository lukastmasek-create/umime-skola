"""Statický náhled banneru = první snímek animace (public/cosmetics/banners/<id>.webp), aby seznam ladil s profilem."""
import sys

from PIL import Image

scene = sys.argv[1]
src = sys.argv[2] if len(sys.argv) > 2 else f"public/cosmetics/banners/anim/{scene}.webp"
im = Image.open(src)
im.seek(0)
im.convert("RGB").save(f"public/cosmetics/banners/{scene}.webp", quality=82, method=5)
print("still", scene)
