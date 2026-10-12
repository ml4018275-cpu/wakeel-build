# وَكِيل (WAKEEL)
- `www/` : التطبيق نفسه (PWA) — ده اللي بيتنسخ جوه الـ APK
- `capacitor.config.json` + `package.json` + `package-lock.json` : تغليف APK بـ Capacitor
- `setup-android-env.sh` : تجهيز بيئة بناء أندرويد
- `native-optional/wakeel-cap.js` : جسر الإضافات native (مش متوصل بالتطبيق حاليًا — للمرحلة الجاية)
- `docs/review-wakeel.md` : تقرير المراجعة

الخطوات: npm install → npx cap add android → npx cap sync android → npm run build:debug

## بناء الـ APK بدون كمبيوتر (GitHub Actions)
1. ارفع كل محتوى المشروع على مستودع GitHub جديد (يشمل مجلد .github)
2. تاب Actions ← Build WAKEEL APK ← Run workflow
3. بعد ~5 دقايق افتح التشغيل ونزّل wakeel-debug-apk من Artifacts
