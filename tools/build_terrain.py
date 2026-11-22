"""assets/moon_terrain.js 다시 만들기. 관찰 지점 주변의 지형 조각(높이 + 색).
자료: NASA SVS CGI Moon Kit (https://svs.gsfc.nasa.gov/4720)
  - ldem_64_uint.tif  높이, 64픽셀/도(약 474 m), 단위 0.5 m
  - lroc_color_poles.tif  색, 76픽셀/도
사용: python tools/build_terrain.py [원본 tif 폴더] [미리보기 폴더]
  원본 tif 폴더에 파일이 없으면 내려받음(약 1 GB). Pillow, numpy 필요.
"""
import base64, io, json, os, sys, urllib.request
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
BASE = "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/"
R_KM = 1737.4
N = 512          # 높이 격자 한 변
NC = 768         # 색 그림 한 변
# index.html의 SPOTS와 같은 좌표. size는 한 변 길이(km)
PATCHES = [
    ("sea1", 8.5, 31.4, 300),
    ("sea2", 32.8, -15.6, 300),
    ("cr1", -43.3, -11.4, 260),
    ("cr2", 9.6, -20.1, 280),
    ("hi", -22.0, 22.0, 300),
    ("far", -4.0, -157.4, 300),
]


def get(folder, name):
    p = os.path.join(folder, name)
    if not os.path.exists(p):
        print("내려받는 중:", name)
        urllib.request.urlretrieve(BASE + name, p)
    return p


def sample(arr, lat, lon):
    """등장방형 지도(가운데가 경도 0)에서 쌍선형 보간."""
    h, w = arr.shape[:2]
    x = ((lon + 180.0) / 360.0 * w - 0.5) % w
    y = np.clip((90.0 - lat) / 180.0 * h - 0.5, 0, h - 1.001)
    x0 = np.floor(x).astype(np.int64); y0 = np.floor(y).astype(np.int64)
    fx = (x - x0); fy = (y - y0)
    x1 = (x0 + 1) % w; y1 = y0 + 1
    if arr.ndim == 3:
        fx = fx[..., None]; fy = fy[..., None]
    a = arr[y0, x0].astype(np.float32); b = arr[y0, x1].astype(np.float32)
    c = arr[y1, x0].astype(np.float32); d = arr[y1, x1].astype(np.float32)
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def grid(lat0, lon0, size, n):
    """지점을 가운데 둔 평면 격자(동쪽 x, 북쪽 y, km)의 위도·경도. 행 0이 북쪽."""
    t = (np.arange(n) + 0.5) / n - 0.5
    x, y = np.meshgrid(t * size, -t * size)
    lat = lat0 + np.degrees(y / R_KM)
    lon = lon0 + np.degrees(x / (R_KM * np.cos(np.radians(lat))))
    return lat, lon


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "tools/cache"
    prev = sys.argv[2] if len(sys.argv) > 2 else None
    os.makedirs(src, exist_ok=True)
    dem = np.array(Image.open(get(src, "ldem_64_uint.tif")))
    col = np.array(Image.open(get(src, "lroc_color_poles.tif")).convert("RGB"))
    out = {}
    for pid, lat0, lon0, size in PATCHES:
        lat, lon = grid(lat0, lon0, size, N)
        hm = sample(dem, lat, lon) * 0.5            # m
        lo, hi = float(hm.min()), float(hm.max())
        q = np.round((hm - lo) / (hi - lo) * 65535).astype("<u2")
        lat, lon = grid(lat0, lon0, size, NC)
        rgb = np.clip(sample(col, lat, lon), 0, 255).astype(np.uint8)
        buf = io.BytesIO(); Image.fromarray(rgb).save(buf, "JPEG", quality=85)
        out[pid] = {"lat": lat0, "lon": lon0, "size": size, "n": N,
                    "range": round(hi - lo, 1),
                    "h": base64.b64encode(q.tobytes()).decode(),
                    "c": "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()}
        print(pid, "높이 차 %.0f m" % (hi - lo), "색 %d KB" % (buf.tell() // 1024))
        if prev:
            os.makedirs(prev, exist_ok=True)
            Image.fromarray(rgb).save(os.path.join(prev, pid + "_color.jpg"))
            gy, gx = np.gradient(hm, size * 1000 / N)
            sh = np.clip(0.5 + (gx * 0.7 + gy * 0.7) * 2.5, 0, 1)   # 북서쪽에서 비춘 음영
            Image.fromarray((sh * 255).astype(np.uint8)).save(os.path.join(prev, pid + "_shade.png"))
    with open("assets/moon_terrain.js", "w") as f:
        f.write("window.MOON_TERRAIN=" + json.dumps(out, separators=(",", ":")) + ";\n")
    print("assets/moon_terrain.js 작성, %.1f MB" % (os.path.getsize("assets/moon_terrain.js") / 1e6))


if __name__ == "__main__":
    main()
