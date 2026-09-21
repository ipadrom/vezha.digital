"""Composite original emulator captures into the existing phone artwork."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import numpy as np

assets = Path(__file__).resolve().parents[2] / 'frontend/public/cases/ssag/2026-09'
original = Image.open(assets/'cover-phones.png').convert('RGBA')
scale = 3
base = original.resize((original.width*scale,original.height*scale),Image.Resampling.LANCZOS)

def insert(name, corners, radius, contour=None):
    global base
    screen = Image.open(assets/'screens'/f'{name}.png').convert('RGBA')
    if contour:
        screen = ImageOps.expand(screen,border=(0,55,0,0),fill='#fffbf4')
    w,h=screen.size
    mask=Image.new('L',(w,h)); ImageDraw.Draw(mask).rounded_rectangle((0,0,w-1,h-1),radius=radius,fill=255)
    screen.putalpha(mask)
    # Pillow requires the inverse projective map: artwork pixels -> capture pixels.
    mat=[]; rhs=[]
    for (x,y),(u,v) in zip([(x*scale,y*scale) for x,y in corners],[(0,0),(w,0),(w,h),(0,h)]):
        mat.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]])
        rhs.extend([u,v])
    coeff=np.linalg.solve(np.array(mat),np.array(rhs))
    layer=screen.transform(base.size,Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
    if contour:
        # Trace the actual glass outline: generated frame corners are not a
        # mathematically rounded rectangle, so a generic radius leaves a halo.
        points=[]
        for p0,p1,p2,p3 in contour:
            for t in np.linspace(0,1,48):
                point=(1-t)**3*np.array(p0)+3*(1-t)**2*t*np.array(p1)+3*(1-t)*t*t*np.array(p2)+t**3*np.array(p3)
                points.append(tuple(point*scale))
        glass=Image.new('L',base.size)
        ImageDraw.Draw(glass).polygon(points,fill=255)
        layer.putalpha(glass)
    base=Image.alpha_composite(base,layer)

# Extend the dark inner bezel into the exposed strip, so moving the glass
# inward cannot uncover any of the old generated screen underneath.
bezel_points=[]
for t in np.linspace(0,1,100):
    p=(1-t)**3*np.array((1236,773))+3*(1-t)**2*t*np.array((1258,550))+3*(1-t)*t*t*np.array((1284,292))+t**3*np.array((1301,110))
    bezel_points.append(tuple((p-np.array((5,0)))*scale))
ImageDraw.Draw(base).line(bezel_points,fill='#202423',width=12*scale)
ImageDraw.Draw(base).polygon([(x*scale,y*scale) for x,y in [(1221,773),(1238,773),(1240,802),(1263,817),(1251,823),(1227,811),(1219,796)]],fill='#202423')
insert('map',[(1295,96),(1589,135),(1542,855),(1225,811)],0,[
    ((1301,110),(1306,100),(1315,101),(1329,104)),
    ((1329,104),(1390,112),(1490,125),(1543,134)),
    ((1543,134),(1571,138),(1584,152),(1583,180)),
    ((1583,180),(1573,365),(1553,655),(1541,812)),
    ((1541,812),(1539,840),(1529,853),(1506,849)),
    ((1506,849),(1431,839),(1308,824),(1261,816)),
    ((1261,816),(1240,812),(1231,800),(1236,773)),
    ((1236,773),(1258,550),(1284,292),(1301,110)),
])
insert('sos',[(893,55),(1268,35),(1179,880),(787,849)],145)
base=base.resize(original.size,Image.Resampling.LANCZOS)
# The camera apertures belong to the physical mockup, not to the app UI.
camera_mask=Image.new('L',original.size)
draw=ImageDraw.Draw(camera_mask)
draw.ellipse((1059,55,1081,78),fill=255)
draw.ellipse((1433,128,1451,146),fill=255)
base=Image.composite(original,base,camera_mask)
base.convert('RGB').save(assets/'cover-phones-real.png')
print('Composited two original captures with projective transforms.')
