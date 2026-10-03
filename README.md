## Mekan Pusulası

Bu proje, Firebase Authentication ve Firestore kullanarak çalışan bir rastgele mekan seçici uygulamasıdır.

Website linki: https://mekan-41520.web.app/



## Kurulum

1. Firebase Console üzerinden yeni bir proje oluşturun.
2. Authentication > Email/Password etkinleştirin.
3. Firestore Database oluşturun.
4. Proje ayarları içindeki web uygulamasını ekleyin.
5. `firebase-config.js` dosyasındaki değerleri kendi Firebase bilgilerinizle doldurun.
6. Tarayıcıda `index.html` veya `mekan_seçim.html` dosyasını açın.

## Görev alanı

- `index.html` ve `mekan_seçim.html`: arayüz
- `style.css`: tasarım
- `firebase-config.js`: Firebase API bilgileri
- `app.js`: giriş, kayıt, mekan ekleme ve rastgele seçim mantığı

## Firestore örnek güvenlik kuralı

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mekanlar/{docId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Not

`firebase-config.js` dosyasındaki alanları doldurmazsanız uygulama Firebase'e bağlanmaz.
