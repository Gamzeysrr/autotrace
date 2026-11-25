# AutoTrace — 90 saniyelik demo akışı

1. **Problem (15 sn):** “İkinci el alıcı, aynı araç için iki farklı ekspertiz raporunu yan yana bulamayabiliyor. Bir PDF'in sonradan değişip değişmediğini anlamak da zor.”
2. **Çelişki (20 sn):** Rapor Karşılaştırma'da **Sentetik PDF A/B’yi yükle ve karşılaştır** düğmesine bas; PDF metinleri cihaz içinde çıkarılır ve “Kaput: Orijinal / Boyalı” uyuşmazlığı gösterilir. “Uygulama doğru raporu seçmiyor; alıcıya incelemesi gereken yeri gösteriyor.”
3. **Gizlilik ve bütünlük (20 sn):** Hash ekranında PDF A hash düğmesine basıp eşleşmeyi göster; ardından PDF B düğmesiyle eşleşmeme durumunu göster ve zincir adımı için A'ya geri dön. “Belge cihazdan çıkmıyor; hash içerik doğruluğu değil, birebir dosya bütünlüğü hakkında kanıt.”
4. **Solana (25 sn):** Phantom Devnet'e bağlıyken kanıtı kaydet. Cüzdan onay ekranında Memo'yu göster: SHA-256 özeti ve AutoTrace etiket bilgisi var; dosyanın kendisi gönderilmez. İşlem ve ödeyen cüzdan adresi herkese açıktır.
5. **Kapanış (10 sn):** “AutoTrace, dağınık ekspertiz kayıtlarını karşılaştırılabilir ve sonradan değiştirildiği fark edilebilir hale getiriyor. Bir sonraki adımımız doğrulanmış ekspertiz kuruluşu imzaları.”

## Sunumdan önce

- Phantom'da Devnet ve yeterli test SOL bakiyesi olduğundan emin ol. Gerekirse resmî [Solana Devnet faucet](https://faucet.solana.com/) üzerinden test SOL al.
- Yerel web sunucusu çalışsın; Phantom ve Solana Devnet RPC için internet bağlantısı olsun.
- Demo raporlarının sentetik olduğunu görünür tut; Toyota/plaka/kurum/gerçek müşteri iddiasında bulunma.
- Explorer işlem sayfasını hazırlamak için önce onaylı Devnet transaction'ı oluştur.
- Kayıt öncesi UI prototipinin ve AI kodlama yardımının kullanıldığını, etkinlik başlamadan önce var olan çalışmaları kuralların istediği biçimde açıkla. Etkinlikte geliştirilenleri ayrı belirt.
- Ön etkinlik doğrulama işlemi: [Devnet Explorer kaydı](https://explorer.solana.com/tx/2PTL3jpTcUn1j3pTiAKwKQ49VQSDDS8sShsbzgrwcL7ZgPzgVHmDXuNn2iS2VsfbTQrtU78DEQCsZpgUUpQToeK?cluster=devnet), slot `526136076`. Bunu hackathon sprint katkısı gibi sunma.

## Beklenen demo hash değerleri

- PDF A (referans eşleşmesi): `FD4D228CDEE84DA3D2C6DA6E8223982C66B5B15794F8058966BF342602EF767C`
- PDF B (farklı içerik): `D6C8069E569D53F805F26696D45C566A5E9D05C3E7EA9C1D8BACD43E201C9A7E`
