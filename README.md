# PixelStudio Pro

A responsive browser photo-editor starter built with HTML, CSS, JavaScript and a small Express server.

## Run locally
1. Install Node.js LTS.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Included working features
- Upload image files in a browser
- Brightness, contrast, saturation, warmth, exposure
- Hue, vibrance and RGB channel balance
- Blur, vignette, grain and a basic sharpen effect
- Six presets
- Rotate, flip, add centred text
- Undo/redo, compare original while holding button
- JPG, PNG and WebP export with quality setting
- Mobile-friendly layout

## Important limitations
This is an upgraded starter, not a finished Photoshop replacement. Layers are currently simple text overlays; RGB controls are channel balance rather than editable curve graphs; HSL is represented by global hue/vibrance controls. Crop, masks, true selective brush editing, multi-layer compositing, advanced perspective correction, and real AI object removal/background removal/generative fill are not implemented yet. The "sharpen" effect is a simple browser-side filter and can be slow on very large images.

AI features need an actual model/API and a secure server integration. Never put provider API keys in browser JavaScript. The starter does not upload photos to an AI provider.

## Hosting
Deploy the project folder to a Node.js host that supports Express. Use `npm install` as build command and `npm start` as start command. Add a custom domain after deployment.

## Before public launch
Add your own About, Contact, Terms and Privacy pages; verify image handling and performance; configure backups/monitoring; and review the current ad-network policies. Ad approval and earnings are not guaranteed.
