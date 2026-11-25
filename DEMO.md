# AutoTrace — sunum akışı

## 90 saniyede üç senaryo

1. Araç geçmişi sayfasında **Ön hasar** senaryosunu seç (`ATQ23A1B000000001`). Sigorta hasar özeti, hasar dosyası ve sonraki ekspertiz kaydını kaynak ve tarihle göster. İlk olay özetinde kaput yokken, sonraki hasar dosyasında kaput boya kalemi bulunmasını “incelenecek fark” olarak anlat.
2. **Dolu hasarı** senaryosunu seç (`ATQ24C2D000000002`). Hasar, sigorta işlemi, boyasız onarım ve ekspertizde orijinal boya kaydı arasındaki uyumu göster.
3. **Arka hasar** senaryosunu seç (`ATQ20E3F000000003`). Sigorta dosyasındaki bagaj kapağı değişimi, sonraki ekspertizde “orijinal” bilgisi ve kaynağı doğrulanmamış kullanıcı raporu arasındaki farkı göster.
4. Kayıt defterinde 11 senaryo kaydını ve her birinin kaynak rolü/tarihini incele.
5. Kurum kaydı oluştur sayfasında tarayıcıya kayıt ekle; dosya eklenirse yalnızca hash'i yerel hesaplanır.
6. İstersen Phantom ile Devnet'e hash gönder. Cüzdan Memo'suna VIN veya rapor bilgisi girmez. Hash'in belge içeriğinin doğru olduğunu veya kaynak kurumun gerçek olduğunu kanıtlamadığını söyle.

## Açıkça belirt

- Bu üç arama kodu standart VIN/gerçek şasi numarası değildir; kayıtlar sunum senaryolarıdır.
- Senaryo kayıtları herhangi bir sigorta şirketi, ekspertiz firması, servis veya kamu kaynağından alınmadı. Kurum isimleri yerine kaynak rolleri gösterilir.
- Siteye gerçek kurum bağlantısı, backend, ortak sicil veya kurumsal imza doğrulaması eklenmiş değildir. Kullanıcının eklediği kayıt yalnızca kendi tarayıcısında saklanır.
- Bu yüzden site canlı araç geçmişi hizmeti değildir. Ürünün hedeflediği akışı gösteren prototiptir.

## Çalıştırma

Windows'ta `AutoTrace-Open.bat` dosyasına çift tıkla veya yerel sunucuda `http://127.0.0.1:4173/` adresini aç. Devnet işlemi için Phantom'da Solana Devnet seç; Memo'yu gözden geçirip işlemi kendin onayla.
