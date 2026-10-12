#!/usr/bin/env python3
"""Arma pub.html (para el artifact) e index.html (independiente, con SEO). Uso: python3 build.py"""
import os, random, urllib.parse, json
H = os.path.dirname(os.path.abspath(__file__))  # fuente/ ; genera index.html aquí y copia a ../
R = lambda f: open(os.path.join(H, f), encoding='utf-8').read()

# borde rasgado (máscara SVG repetible de 1200x24)
random.seed(7)
pts, x = [], 0
while x < 1200:
    pts.append(f"{x:.0f},{random.uniform(2, 14) if random.random() > .15 else random.uniform(0, 22):.1f}")
    x += random.uniform(6, 26)
pts.append("1200,8")
svg = f"<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='24' viewBox='0 0 1200 24'><path d='M0,24 L0,8 L{' L'.join(pts)} L1200,24 Z'/></svg>"
rip = "data:image/svg+xml," + urllib.parse.quote(svg, safe="/:=,' ")
css = R('style.css').replace('{{RIP}}', rip)
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Anton&family=Damion&family=Inter:wght@400;500;600;700&family=UnifrakturMaguntia&display=swap" rel="stylesheet">'
body, js = R('body.html'), R('app.js')
LD = [{
  "@context": "https://schema.org", "@type": "CafeOrCoffeeShop", "name": f"Pistazie {n}", "servesCuisine": ["Café", "Waffles", "Crêpes", "Hamburguesas", "Pizzas", "Pastas"],
  "address": {"@type": "PostalAddress", "streetAddress": a, "addressLocality": l, "addressRegion": "Carabobo", "addressCountry": "VE"},
  "telephone": t, "openingHours": "Mo-Su 08:00-23:00", "priceRange": "$", "slogan": "We serve art.",
  "sameAs": ["https://www.instagram.com/pistazieve/", "https://linktr.ee/pistazie"]}
  for n, a, l, t in [("La Viña", "Av. Andrés Eloy Blanco", "Valencia", "+58 414-663-6666"), ("San Diego", "Av. Intercomunal Don Julio Centeno", "San Diego", "+58 414-333-2333")]]
ld = f'<script type="application/ld+json">{json.dumps(LD, ensure_ascii=False)}</script>'
open(os.path.join(H, 'pub.html'), 'w', encoding='utf-8').write(
  f'<title>Pistazie</title>{FONTS}<style>{css}</style>{body}<script>{js}</script>{ld}')
DOMAIN = 'https://www.pistazie.com'  # CAMBIAR por el dominio real
DESC = 'Pistazie: waffles, crêpes, café, hamburguesas, pizzas y pastas en Valencia y San Diego, Carabobo. Abierto todos los días de 8 am a 11 pm. We serve art.'
head = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Pistazie · Waffles, crêpes y café en Valencia</title><meta name="description" content="{DESC}"><link rel="canonical" href="{DOMAIN}/">
<meta name="theme-color" content="#0d0d0d"><link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:title" content="Pistazie · We serve art."><meta property="og:description" content="{DESC}"><meta property="og:image" content="{DOMAIN}/img/og.jpg"><meta property="og:url" content="{DOMAIN}/"><meta property="og:locale" content="es_VE">
<meta name="twitter:card" content="summary_large_image">{FONTS}<style>{css}</style>{ld}</head><body>'''
open(os.path.join(H, 'index.html'), 'w', encoding='utf-8').write(f'{head}{body}<script>{js}</script></body></html>')
print('ok', len(css), len(body), len(js))
