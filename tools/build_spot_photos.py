"""관찰 2의 질문 칸에 넣는 사진 만들기. 교과서 사진이 없는 지점용.
NASA SVS CGI Moon Kit의 색 지도(실제 촬영 사진을 이어 붙인 것)를 지점 중심으로 잘라 내고,
높이 자료로 만든 음영을 옅게 더해 높낮이가 보이게 함.
사용: python tools/build_spot_photos.py [원본 tif 폴더]   → assets/spot_<id>.jpg
"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
import build_terrain as bt

W, H = 720, 460
# (id, 위도, 경도, 가로 길이 km). 바다는 주변의 밝은 곳이 함께 보이도록 넓게 잡음
SPOTS = [("sea1", 8.5, 31.4, 900), ("sea2", 32.8, -15.6, 1100), ("cr1", -43.3, -11.4, 300)]


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "tools/cache"
    dem = np.array(Image.open(bt.get(src, "ldem_64_uint.tif")))
    col = np.array(Image.open(bt.get(src, "lroc_color_poles.tif")).convert("RGB"))
    for pid, lat0, lon0, size in SPOTS:
        t = (np.arange(W) + 0.5) / W - 0.5
        x, y = np.meshgrid(t * size, -t[(W - H) // 2:(W + H) // 2] * size)
        lat = lat0 + np.degrees(y / bt.R_KM)
        lon = lon0 + np.degrees(x / (bt.R_KM * np.cos(np.radians(lat))))
        rgb = bt.sample(col, lat, lon)
        hm = bt.sample(dem, lat, lon) * 0.5
        gy, gx = np.gradient(hm, size * 1000 / W)
        shade = np.clip(1.0 + (gx * 0.8 + gy * 0.6) * 2.2, 0.35, 1.6)   # 북서쪽에서 비춘 음영
        img = np.clip(rgb * shade[..., None] * 1.12, 0, 255).astype(np.uint8)
        p = "assets/spot_%s.jpg" % pid
        Image.fromarray(img).save(p, "JPEG", quality=86)
        print(p, os.path.getsize(p) // 1024, "KB")


if __name__ == "__main__":
    main()
