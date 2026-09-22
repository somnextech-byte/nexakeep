# NexaKeep

NexaKeep is a point-of-sale (POS) web application with a companion Android app (online & offline editions), built for Somnex Digimark.

## Versions

| Version | Notes |
|---------|-------|
| **v2.1.0** | Latest release — Online + Offline APKs, updated download links. |
| v2.0.0 | Previous online release. |
| v1.0.0 | Initial offline release. |

## Downloads (v2.1.0)

- **Online APK:** https://somnextech-byte.github.io/nexakeep/assemble.html?variant=online
  Full-featured app with real-time sync and cloud access (Firebase). APK parts stored in this repo under `apk/online/`.
- **Offline APK:** https://somnextech-byte.github.io/nexakeep/assemble.html?variant=offline
  Lightweight app that works fully offline — no internet needed. APK parts stored in this repo under `apk/offline/`.
- **Web version:** https://nexakeep.web.app/

## Tech Stack

- Vite
- Firebase (Auth, Hosting)
- Vanilla HTML/CSS/JS with i18n (English / Somali)

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## License

MIT