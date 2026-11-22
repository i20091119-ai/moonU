"""달 전체 모형의 고화질 자료 만들기. NASA SVS CGI Moon Kit (https://svs.gsfc.nasa.gov/4720)
  assets/moon_normal.js   음영용 법선 지도 4096×2048 (ldem_64 높이 자료에서 계산). 모든 기기에서 씀
  assets/moon_color8k.js  색 지도 8192×4096. 큰 텍스처를 쓸 수 있는 기기에서만 나중에 불러옴
사용: python tools/build_textures_hq.py [원본 tif 폴더]     (Pillow, numpy 필요. 원본 약 1 GB)
"""
import base64, io, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
import build_terrain as bt

Image.MAX_IMAGE_PIXELS = None
NW, NH = 4096, 2048
SLOPE_GAIN = 2.0     # 기울기를 이만큼 키워 적음. 화면에서는 normalScale로 다시 조절


def b64jpg(img, q):
    buf = io.BytesIO(); img.save(buf, "JPEG", quality=q, optimize=True)
    return base64.b64encode(buf.getvalue()).decode(), buf.tell()


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "tools/cache"
    dem = Image.open(bt.get(src, "ldem_64_uint.tif"))
    # 23040×11520 → 4096×2048, 넓이 평균으로 줄임(단위 0.5 m → m)
    h = np.asarray(dem.resize((NW, NH), Image.BOX), dtype=np.float32) * 0.5
    lat = np.radians(90 - (np.arange(NH) + 0.5) / NH * 180)[:, None]
    dx = 2 * np.pi * bt.R_KM * 1000 / NW * np.maximum(np.cos(lat), 0.05)   # 동서 한 칸(m)
    dy = np.pi * bt.R_KM * 1000 / NH                                        # 남북 한 칸(m)
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / (2 * dx)                  # 동쪽으로 오르는 기울기
    gy = np.zeros_like(h); gy[1:-1] = (h[:-2] - h[2:]) / (2 * dy)           # 북쪽으로 오르는 기울기
    nx, ny, nz = -gx * SLOPE_GAIN, -gy * SLOPE_GAIN, np.ones_like(h)
    n = np.sqrt(nx * nx + ny * ny + nz * nz)
    rgb = np.stack([nx / n, ny / n, nz / n], -1) * 0.5 + 0.5
    s, kb = b64jpg(Image.fromarray(np.clip(rgb * 255 + 0.5, 0, 255).astype(np.uint8)), 90)
    with open("assets/moon_normal.js", "w") as f:
        f.write('window.MOON_NORMAL="data:image/jpeg;base64,%s";\n' % s)
    print("assets/moon_normal.js %.1f MB" % (kb * 4 / 3 / 1e6))

    col = Image.open(bt.get(src, "lroc_color_poles.tif")).convert("RGB").resize((8192, 4096), Image.LANCZOS)
    s, kb = b64jpg(col, 82)
    with open("assets/moon_color8k.js", "w") as f:
        f.write('window.MOON_COLOR8K="data:image/jpeg;base64,%s";\n' % s)
    print("assets/moon_color8k.js %.1f MB" % (kb * 4 / 3 / 1e6))


if __name__ == "__main__":
    main()
