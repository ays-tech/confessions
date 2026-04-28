# Generating PWA Icons

Use any of these free tools to generate all icon sizes from a single 512x512 emoji/image:

## Option A — pwa-asset-generator (recommended)
```bash
npx pwa-asset-generator icon-source.png ./public/icons --manifest ./public/manifest.json --index ./app/layout.tsx
```

## Option B — Online (no install)
Go to https://realfavicongenerator.net or https://www.pwabuilder.com/imageGenerator
Upload a 512x512 image of 😭 on dark background #080808
Download and place in /public/icons/

## Quick DIY icon (paste in browser console on any page)
```javascript
const canvas = document.createElement('canvas');
canvas.width = 512; canvas.height = 512;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#080808';
ctx.fillRect(0, 0, 512, 512);
ctx.font = '320px serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('😭', 256, 270);
const a = document.createElement('a');
a.download = 'icon-512x512.png';
a.href = canvas.toDataURL();
a.click();
```
Then resize to all needed sizes using any image editor.
