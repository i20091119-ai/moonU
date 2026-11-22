"""관찰 2의 '충돌 구덩이' 판정에 쓰는 큰 구덩이 목록을 NASA 높이 자료로 확인하고,
어두운 곳·밝은 곳 판정에 쓸 밝기 기준을 색 지도에서 잼.
  - 구덩이: 목록의 위치에서 가운데가 테두리보다 실제로 낮은지 봄(가운데 0.4R 평균 < 테두리 0.9~1.1R 평균)
  - 밝기: 색 지도(moon_tex.js의 4K)를 512×256으로 줄여, 알려진 바다·밝은 곳 지점과 전체 분포를 출력
사용: python tools/check_craters.py [원본 tif 폴더]
목록의 이름·위도·경도·지름은 국제천문연맹(IAU) 행성 명명 목록(USGS Gazetteer of Planetary Nomenclature)의 값.
"""
import base64, io, os, re, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
import build_terrain as bt

Image.MAX_IMAGE_PIXELS = None
# 이름, 위도, 경도(동경 +), 지름 km
CRATERS = [
    ("코페르니쿠스", 9.62, -20.08, 96), ("티코", -43.30, -11.22, 85), ("케플러", 8.12, -38.01, 31),
    ("아리스타르코스", 23.73, -47.49, 40), ("플라톤", 51.62, -9.38, 101), ("아르키메데스", 29.72, -3.99, 81),
    ("에라토스테네스", 14.47, -11.32, 59), ("클라비우스", -58.62, -14.73, 231), ("프톨레마이오스", -9.16, -1.84, 154),
    ("알폰수스", -13.39, -2.85, 111), ("아르자헬", -18.26, -1.93, 97), ("테오필루스", -11.45, 26.28, 99),
    ("키릴루스", -13.29, 24.07, 98), ("카타리나", -17.98, 23.55, 99), ("랑그레누스", -8.86, 61.04, 132),
    ("페타비우스", -25.39, 60.84, 184), ("포시도니우스", 31.88, 29.99, 95), ("아리스토텔레스", 50.24, 17.32, 88),
    ("에우독소스", 44.27, 16.23, 70), ("그리말디", -5.38, -68.36, 173), ("가상디", -17.55, -39.96, 111),
    ("불리알두스", -20.75, -22.26, 61), ("마기누스", -50.03, -6.34, 156), ("롱고몬타누스", -49.55, -21.88, 146),
    ("시카르트", -44.38, -55.11, 212), ("치올콥스키", -20.38, 128.97, 185), ("가가린", -19.7, 149.4, 262),
    ("아이트켄", -16.8, 173.4, 138), ("잭슨", 22.05, -163.32, 71), ("다이달로스", -5.9, 179.4, 93),
    ("반 더 그라프", -27.4, 172.2, 240), ("코롤료프", -4.19, -157.47, 423),
]


def ring_mean(dem, lat0, lon0, r0, r1, n=720):
    out = []
    for rr in np.linspace(r0, r1, 5):
        a = np.linspace(0, 2 * np.pi, n, endpoint=False)
        lat = lat0 + np.degrees(rr * np.sin(a) / bt.R_KM)
        lon = lon0 + np.degrees(rr * np.cos(a) / (bt.R_KM * np.cos(np.radians(lat))))
        out.append(bt.sample(dem, lat, lon).mean() * 0.5)
    return float(np.mean(out))


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "tools/cache"
    dem = np.array(Image.open(bt.get(src, "ldem_64_uint.tif")))
    bad = 0
    for name, lat, lon, d in CRATERS:
        R = d / 2
        c = ring_mean(dem, lat, lon, 0, 0.4 * R)
        rim = ring_mean(dem, lat, lon, 0.9 * R, 1.1 * R)
        ok = rim - c > 300
        bad += not ok
        print("%s %-10s 가운데 %6.0f m, 테두리 %6.0f m, 깊이 %5.0f m" % ("확인" if ok else "의심", name, c, rim, rim - c))
    print("의심 %d개 / %d개" % (bad, len(CRATERS)))

    js = open("assets/moon_tex.js").read()
    b64 = re.search(r'MOON_COLOR="data:image/jpeg;base64,([^"]+)"', js).group(1)
    im = Image.open(io.BytesIO(base64.b64decode(b64))).convert("L").resize((512, 256), Image.BOX)
    L = np.asarray(im, dtype=np.float32)

    def lum(lat, lon, rad=4):
        y = int((90 - lat) / 180 * 256); x = int((lon + 180) / 360 * 512) % 512
        return float(L[max(0, y - rad):y + rad + 1, max(0, x - rad):x + rad + 1].mean())
    for nm, la, lo in [("바다1", 8.5, 31.4), ("바다2", 32.8, -15.6), ("폭풍의 대양", 18, -57), ("구름의 바다", -21, -17),
                       ("밝은 곳", -22, 22), ("티코 둘레", -43, -11), ("남쪽 고지", -60, 0), ("뒷면", -4, -157.4), ("코페르니쿠스", 9.6, -20.1)]:
        print("밝기 %-8s %5.1f" % (nm, lum(la, lo)))
    print("전체 밝기 백분위(10,25,50,75,90):", np.percentile(L, [10, 25, 50, 75, 90]).round(1))
    front = L[:, 128:384]
    print("앞면 밝기 백분위(10,25,50,75,90):", np.percentile(front, [10, 25, 50, 75, 90]).round(1))


if __name__ == "__main__":
    main()
