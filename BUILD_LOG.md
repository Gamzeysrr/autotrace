# AutoTrace katkı başlangıç notu — 25 Kasım 2026

Bu çalışma Dev3pack Global Hackathon başlamadan önce hazırlanıyor. Takım, önceden oluşturulan UI prototipi ile aşağıdaki pre-event MVP kodunu hackathon formunda etkinlik kurallarına uygun biçimde açıklamalıdır. Bunları hackathon sırasında tamamlanmış gibi sunmayın.

- TXT ve metin tabanlı PDF raporlarını yerelde okuma ve alan farklarını bulma.
- Phantom onaylı Solana Devnet Memo işlemi ile seçili dosyanın hash'ini kaydetme.
- Devnet işleminden Memo'yu geri okuyup dosya hash'iyle karşılaştırma.
- İşlemde yalnızca seçili SHA-256 özetini Memo'ya yazma; cüzdan adresinin herkese açık olduğunu arayüzde açıklama.
- PDF.js 3.11.174 ve Solana web3.js 1.98.4 tarayıcı dağıtımlarını yerel pakete dahil etme; üçüncü taraf lisanslarını ekleme.
- Sentetik PDF çiftini tek tıklamayla yükleyip karşılaştırma ve PDF A/B hash'ini dosya seçmeden hesaplama akışı.
- Elle tarayıcı kontrolü: PDF.js iki yerel örneği çıkardı; Kaput farkı bulundu, PDF A referans hash'iyle eşleşti ve PDF B farklı hash üretti.
- Paketlenmiş PDF A/B dosyalarının SHA-256 değerleri yeniden hesaplanıp README ve demo notlarına eklendi.
- Demo araç/olay verisi için tarayıcı localStorage kullanımı.
- Windows için tek tıkla yerel demo başlatıcısı.
- Bu aşamadaki raporlar sentetik; gerçek ekspertiz firması veya kullanıcı verisi yok.
- Ön etkinlik Devnet smoke testi tamamlandı: PDF A hash'i Phantom imzasıyla kaydedildi ve Solana Devnet RPC'den bağımsız olarak okundu. İşlem: `2PTL3jpTcUn1j3pTiAKwKQ49VQSDDS8sShsbzgrwcL7ZgPzgVHmDXuNn2iS2VsfbTQrtU78DEQCsZpgUUpQToeK`; slot `526136076`; `meta.err = null`. Demo/README bunu ön etkinlik doğrulaması olarak işaretler.

Hackathon başlayınca ekip katkılarını tarih/saat, geliştirilen özellik, kimin yaptığı ve kanıt bağlantısı ile ekleyin. Kuralların istediği şekilde etkinlik öncesi kodu açıklayın; yalnızca sprint sırasında yapılan katkıları hackathon çıktısı olarak anlatın.
