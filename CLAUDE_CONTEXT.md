# NJ Design Studio - Claude Context

## Overview

NJ Design Studio is a Vite-based architectural portfolio website for an architecture studio. It is a front-end only project with two entry points:

- Public site: [index.html](index.html)
- Admin portal: [admin.html](admin.html)

The app is built with vanilla JavaScript, vanilla CSS, GSAP for scroll and intro animations, and Three.js for animated 3D background scenes.

## What the Site Does

The public website is a polished dark-themed portfolio site with these sections:

- Hero section with a Three.js animated city/building scene
- Portfolio gallery with category filters and modal project details
- Services section rendered from JavaScript
- Process timeline with a subtle Three.js wireframe background
- About section with team and awards content
- Contact section with a form, Google Maps embed, and another Three.js scene
- Footer and sticky consultation CTA

The admin portal is a browser-based CMS-like interface that manages content locally.

## Data Flow

There is no backend right now.

All persistent content lives in browser storage:

- `localStorage` key: `nj_store`
- `sessionStorage` key: `nj_admin_auth`

The public site and admin page both read and write the same local data. That means changes persist in the current browser, but they do not sync across devices or users.

## Admin Portal

The admin page is a separate HTML entry point that:

- Uses a hardcoded password: `admin123`
- Stores auth state in `sessionStorage`
- Lets you add, edit, and delete portfolio items
- Lets you add, edit, and delete team members
- Shows contact messages saved from the public form
- Marks messages as read and allows deleting them
- Supports client-side image upload and resize before saving base64 data into `localStorage`

This is not production-grade authentication or persistence.

## Main Files

- [src/main.js](src/main.js): public site bootstrapping, navigation, scroll state, section init
- [src/admin.js](src/admin.js): admin login, CRUD, modal editing, message inbox
- [src/utils/store.js](src/utils/store.js): default data and localStorage helpers
- [src/utils/sceneManager.js](src/utils/sceneManager.js): shared Three.js scene wrapper
- [src/utils/buildingGeometry.js](src/utils/buildingGeometry.js): custom building/cityscape geometry and shader material
- [src/sections/hero.js](src/sections/hero.js): hero scene and stat animation
- [src/sections/portfolio.js](src/sections/portfolio.js): portfolio grid, filters, modal
- [src/sections/services.js](src/sections/services.js): services cards
- [src/sections/process.js](src/sections/process.js): process steps and background wireframe
- [src/sections/about.js](src/sections/about.js): team and awards rendering
- [src/sections/contact.js](src/sections/contact.js): contact form and cityscape scene
- [src/sections/blog.js](src/sections/blog.js): blog renderer exists but is not wired into the main page
- [src/style.css](src/style.css): public site styling
- [src/admin.css](src/admin.css): admin portal styling

## Build and Runtime

The project builds successfully with:

```bash
npm run build
```

Useful scripts from [package.json](package.json):

- `npm run dev`
- `npm run build`
- `npm run preview`

## Current State and Caveats

- No backend exists yet
- No real API, database, or server-side auth exists
- Contact submissions are stored locally, not emailed or sent to a service
- The blog module exists but is not mounted in the public app
- [src/counter.js](src/counter.js) is leftover starter code and unused
- The build succeeds, but Vite warns that the main JS bundle is large

## Practical Notes

- The site is best understood as a polished front-end demo or prototype CMS
- Any backend integration should replace localStorage persistence in [src/utils/store.js](src/utils/store.js)
- Any real auth should replace the hardcoded password in [src/admin.js](src/admin.js)
- If the blog should be public, it needs to be wired into [src/main.js](src/main.js) and the HTML

## Quick Mental Model

If you need to change the public site, start from [src/main.js](src/main.js) and the relevant file under [src/sections](src/sections).

If you need to change content persistence or admin behavior, start from [src/utils/store.js](src/utils/store.js) and [src/admin.js](src/admin.js).

If you need to change the 3D visuals, start from [src/utils/buildingGeometry.js](src/utils/buildingGeometry.js) and the section files that instantiate Three.js scenes.