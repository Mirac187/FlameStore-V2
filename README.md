# 🔥 FlameStore

Modern, mobile-first Vue 3 + Firebase PWA. Ana dosyalar FlameStore sunucusunda tutulmaz; kullanıcı kendi depolama bağlantısını seçer ve VirusTotal kontrolünden sonra yayın Cloud Function tarafından oluşturulur.

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Firebase Console'da Authentication > Google ve Email/Password sağlayıcılarını aç. Firestore ve Storage'ı oluştur.

`.env` içine Firebase web config değerlerini yaz.

## Firebase Functions

```bash
cd functions
npm install
cd ..
# Firebase CLI kurulu olmalı
firebase login
firebase use YOUR_PROJECT_ID
firebase functions:secrets:set VT_API_KEY
firebase deploy --only firestore:rules,storage,functions,hosting
```

`scanAndPublish` callable function, seçilen storage linkinin kullanıcıya ait olduğunu doğrular, VirusTotal URL taraması yapar; malicious/suspicious sonuç varsa `apps` dokümanı oluşturulmaz.

## Capacitor APK

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap init FlameStore com.flamestore.app --web-dir dist
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio'da APK/AAB oluşturabilirsin.

## Mimari

- Vue 3 + Vite
- Firebase Auth
- Firestore realtime listeners
- Firebase Storage: yalnızca küçük görseller, maksimum 5 MB
- Cloud Functions + VirusTotal
- PWA service worker
- Capacitor uyumlu SPA
- Firestore Rules ile kullanıcı/rol ayrımı

## Önemli güvenlik notu

DEVELOPER hesabı `mustafamirac000@gmail.com` adresiyle eşleştirilir ve adı `Mavi` olarak sunucu tarafında korunur. Üretimde Firebase App Check, rate limiting, abuse detection ve moderasyon audit loglarının da açılması önerilir.
