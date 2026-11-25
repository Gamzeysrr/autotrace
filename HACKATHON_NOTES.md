# AutoTrace — hackathon çalışma notu

**Tek cümle:** AutoTrace; sigorta, ekspertiz ve servis kayıtlarının VIN ile ilişkilendirildiği, kaynak ve belge bütünlüğünün izlenebildiği bir araç geçmişi ekosistemi prototipidir.

## Ürün hedefi

İkinci el araç alıcısı bir plakayı/VIN'i sorguladığında, aracın geçmişindeki kaza, ekspertiz, onarım ve benzeri kayıtları kaynakları ve zamanlarıyla inceleyebilsin. Kayıt üreticileri yetkili sigorta şirketi, ekspertiz firması veya servis olsun. Plaka değişebileceği için kalıcı araç bağında VIN kullanılır; gerçek sistemde VIN erişimi de izin ve mevzuatla korunmalıdır.

## Hackathon prototipinde gösterilen

- VIN üzerinden sentetik araç geçmişi arama ve kronolojik kayıt akışı.
- Farklı kaynaklardaki kayıtlar arasında örnek alan çelişkisini görünür kılma.
- Kurum katılımcısı görünümünden demo olay/rapor kaydı oluşturma.
- Kayıt/PDF hash'ini tarayıcıda hesaplama ve isteğe bağlı Solana Devnet Memo işlemine Phantom onayıyla yazma.
- Zincire yalnızca SHA-256 özeti, uygulama etiketi ve sürüm gönderme; araç kimliği ve belgeyi zincir dışında bırakma.

## Olmayanlar ve doğru çerçeve

- Gerçek sigorta şirketi, ekspertiz kuruluşu, servis, SBM/kamu veri kaynağı veya gerçek araç kaydı entegrasyonu yoktur.
- Kurum profili gerçek tüzel kişiyi doğrulamaz; demo verisi güvenilir kurum imzası değildir.
- Backend ve paylaşılan araç sicili yoktur. Kullanıcının eklediği kayıt yalnızca kendi tarayıcısında kalır.
- SHA-256/Blockchain, kayıtlanan belgenin sonradan değişmesini gösterebilir; ilk bilginin doğruluğunu veya aracın gerçek fiziksel durumunu ispatlamaz.
- Bu nedenle ürün sunumunda “aracın tüm gerçek geçmişini bugün gösteriyor” deme. “Yetkili katılımcıların kayıtlarını bütünlüğü doğrulanabilir biçimde ilişkilendirmeyi hedefleyen prototip” de.

## Üretim sisteminde kritik işler

1. Kurum katılımını ve yetkili imza anahtarlarını doğrulamak.
2. Sigorta/ekspertiz/servis verisinin yasal erişim koşullarını ve rıza modelini kurmak.
3. VIN ve raporların zincir dışı, şifreli saklanmasını; sorguda erişim yetkisini tasarlamak.
4. Kurumun imzaladığı standartlaştırılmış kayıt şeması ve anahtar iptal/devir akışı oluşturmak.
5. Tekrarlanan, hatalı veya birbiriyle çelişen bildirimleri kaynak ve güven seviyesiyle sunmak.
6. Kişisel verilerin korunması, veri saklama süreleri ve denetim kayıtları için uzman görüşü almak.

## Hackathon katkılarının kaydı

Etkinlik öncesi prototipin mevcut olduğunu açıkla. Sprint başladıktan sonra tarih/saat, ekip üyesi, yeni kod/değişiklik, test kanıtı ve bağlantıyı ayrı kaydet. Önceden üretilmiş UI veya Devnet işlemini etkinlik içi katkı gibi göstermeyin.
