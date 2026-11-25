# AutoTrace — Araç Geçmişi Güven Katmanı

AutoTrace, sigorta şirketleri, ekspertiz firmaları ve servislerin araç geçmişi kayıtlarını kaynaklarıyla eklemesini; araç alıcılarının da VIN üzerinden bu kayıt izini incelemesini amaçlayan Solana tabanlı hackathon prototipidir.

## Bu prototipte gösterilen akış

1. VIN ile araç geçmişi sorgula. Ön hasar için `ATQ23A1B000000001`, dolu hasarı için `ATQ24C2D000000002`, arka hasar için `ATQ20E3F000000003` seç. Bunlar standart VIN değildir; örnek senaryo kodlarıdır.
2. Kaza/hasar, ekspertiz, servis veya kilometre kaydı listesinde kaynak ve tarih bilgisini gör.
3. Raporlar arasındaki örnek tutarsızlığı incele.
4. Kurum kaydı oluştur sayfasından bir örnek kayıt gir. Yeni kayıtlar ve isteğe bağlı PDF özeti yalnızca tarayıcıda işlenir/saklanır.
5. İstersen kaydın SHA-256 özetini Phantom ile Solana Devnet Memo işlemine yaz. Zincire VIN, rapor metni veya PDF gönderilmez.

## Çalıştırma

Windows'ta `AutoTrace-Open.bat` dosyasına çift tıkla. Alternatif olarak PowerShell'de proje klasöründe `python -m http.server 4173 --bind 127.0.0.1` çalıştır ve `http://127.0.0.1:4173/` adresini aç. PDF eki özeti ve Devnet işlemi için HTTPS veya localhost gerekir.

Devnet işlemi için Phantom eklentisini resmi kaynağından kur, Solana ağını Devnet yap ve Phantom penceresinde her Memo'yu kontrol ederek onayla. Test SOL'un gerçek değeri yoktur. Kurtarma kelimelerini veya özel anahtarları hiçbir yere girme.

## Doğruluk ve kapsam sınırları

- Araç, sigorta, ekspertiz, servis, kaza ve tutanak örneklerinin tamamı sentetiktir.
- Bu paket gerçek kurum kimliği doğrulaması, sigorta/kamu veri entegrasyonu, kullanıcı hesabı, backend veya ortak veritabanı içermez. Form kayıtları sadece bu tarayıcıya kaydedilir.
- Prototipteki kurum profilleri demo etiketleridir; gerçek bir kurum imzası olarak sunulmaz.
- Hash, referans kaydı sonrasında belgenin değişip değişmediğini kontrol etmeye yarar. İlk girilen bilginin doğru olduğunu, raporu yetkili kurumun hazırladığını veya aracın fiziksel durumunu tek başına kanıtlamaz.
- Plaka kişisel/veri eşleştirme riski nedeniyle bu prototipte arama anahtarı değildir. Kalıcı eşleştirme için VIN kullanılır; üretim ortamında erişim izni ve mevzuat ayrıca ele alınmalıdır.
- Solana işlemi sadece `app`, sürüm ve SHA-256 değerini Memo'ya yazar. Zincir işlemi hash için zamanlı bir kanıttır; kurumsal imza yerine geçmez.

## Üretim sistemine giden yol

Gerçek ekosistem için yetkili veri üreticileriyle entegrasyon ve sözleşmeler, kurum anahtarıyla dijital imza, güvenli zincir dışı belge saklama, araç sahibinin onayı/erişim yetkisi, denetim izi ve kişisel veri mevzuatına uygun mimari gerekir. Bu hackathon demosu ürün akışını ve bir hash'in Solana Devnet'e yazılmasını gösterir; bu entegrasyonların tamamlandığı iddiasında bulunmaz.

## Teknik bileşenler

Tek HTML/CSS/JavaScript uygulaması, Web Crypto SHA-256, Phantom injected wallet, yerel olarak paketlenmiş `@solana/web3.js` ve Solana Devnet Memo programı. Üçüncü taraf lisansları `vendor/` klasöründedir.
