# AutoTrace — araç geçmişi doğrulama prototipi

AutoTrace, kaza, sigorta, ekspertiz ve servis kayıtlarını araç geçmişi akışında kaynak/tarih bilgisiyle göstermeyi; bir rapor kaydının sonradan değiştirilip değiştirilmediğini Solana Devnet'te kontrol etmeyi amaçlar.

## Örnek senaryolar

- Ön hasar: `ATQ23A1B000000001`
- Dolu hasarı: `ATQ24C2D000000002`
- Arka hasar: `ATQ20E3F000000003`

Bu sorgu kodları standart VIN değildir; kayıtlar tamamen senaryo verisidir. Gerçek sigorta, kamu, servis veya ekspertiz kaynağı bu projeye bağlı değildir.

## Solana Devnet akışı

1. Kurum kaydı formunda kayıt alanlarını ve istersen PDF'yi seç. PDF tarayıcıda okunur, dosyanın kendisi yüklenmez.
2. Tarayıcı kayıt alanlarını rastgele bir tuzla birleştirip SHA-256 hesaplar.
3. Phantom Devnet işlemini imzalar. Memo'ya yalnızca rastgele kayıt kodu ve tuzlanmış hash yazılır. VIN, rapor numarası, kayıt metni ve PDF zincire girmez.
4. İşlemden sonra indirilen JSON doğrulama paketini alıcıya gönder. Paket rapor alanlarını ve VIN'i içerebilir; bu yüzden yalnızca paylaşma iznin olan kişiye ilet.
5. Alıcı **Zincir kanıtını doğrula** sayfasında paketi yükler. Uygulama JSON hash'ini Devnet Memo'suyla, isteğe bağlı aynı PDF'yi de paket içindeki PDF hash'iyle karşılaştırır; işlem imzalayan cüzdanı gösterir.

## Çalıştırma

Windows'ta `AutoTrace-Open.bat` dosyasına çift tıkla. Alternatif olarak PowerShell'de proje klasöründe `python -m http.server 4173 --bind 127.0.0.1` çalıştır ve `http://127.0.0.1:4173/` adresini aç. Devnet doğrulaması ve Phantom için internet gerekir.

Phantom'da Solana ağını **Devnet** seç. İşlem Memo'sunu inceleyip cüzdanında onayla. Test SOL'un gerçek değeri yoktur. Kurtarma kelimelerini veya özel anahtarları hiçbir yere girme.

## Sınırlar

- Uygulama şu an özel Anchor programı veya PDA kayıt sicili kullanmaz; Solana Memo Programı'na işlem gönderir.
- Araç senaryo kayıtları ve yeni form kayıtları tarayıcı `localStorage` alanında tutulur. Ortak VIN arama servisi veya backend yoktur.
- İmzalayan cüzdan, bir kurumun gerçek tüzel kimliğini kanıtlamaz. Kurum anahtarı kayıt/allowlist sistemi henüz yoktur.
- Devnet Memo'su bir hash için herkese açık, değiştirilemez bir referans sunar. Hash ilk girilen bilginin doğru olduğunu veya araç durumunu kanıtlamaz.
- Bir üretim ürününde VIN->kayıt eşlemesi erişim kontrollü zincir dışı bir serviste, doğrulama kanıtları Solana'da tutulmalı; gerçek kurum imzaları ve onaylı issuer kayıtları eklenmelidir.

## Teknik

Tek HTML/CSS/JavaScript uygulaması, Web Crypto SHA-256, Phantom injected wallet, yerel `@solana/web3.js` tarayıcı paketi ve Solana Devnet Memo Programı. Üçüncü taraf lisansları `vendor/` klasöründedir.
