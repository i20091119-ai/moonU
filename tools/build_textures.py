"""assets/moon_tex.js 다시 만들기. NASA SVS CGI Moon Kit (https://svs.gsfc.nasa.gov/4720)
사용: python tools/build_textures.py   (Pillow, numpy 필요)"""
import base64, io, urllib.request
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
BASE = "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/"
COLOR = "lroc_color_poles_4k.tif"   # 8k는 lroc_color_poles_8k.tif
HEIGHT = "ldem_16_uint.tif"


def fetch(name):
    with urllib.request.urlopen(BASE + name) as r:
        return io.BytesIO(r.read())


def b64jpg(img, q):
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=q)
    return base64.b64encode(buf.getvalue()).decode()


color = Image.open(fetch(COLOR)).convert("RGB")
h = np.array(Image.open(fetch(HEIGHT))).astype(np.float32)
h = (h - h.min()) / (h.max() - h.min())
height = Image.fromarray((h * 255).astype(np.uint8)).resize((2048, 1024), Image.LANCZOS)
with open("assets/moon_tex.js", "w") as f:
    f.write('window.MOON_COLOR="data:image/jpeg;base64,%s";\n' % b64jpg(color, 86))
    f.write('window.MOON_HEIGHT="data:image/jpeg;base64,%s";\n' % b64jpg(height, 88))
print("assets/moon_tex.js 작성")
