# AutoTrace — hackathon çalışma notu

**Tek cümle:** AutoTrace, ikinci el araç alıcısının iki ekspertiz raporundaki çelişkiyi görmesini ve belirli bir rapor dosyasının sonradan değişip değişmediğini Solana üzerinde doğrulamasını sağlar.

## Dar MVP odağı

Genel “aracın bütün geçmişini blockchain'e taşımak” iddiası yerine ilk gösterilebilir problem: **aynı araç kimliği için düzenlenen raporlar çeliştiğinde alıcı bunu fark edebilsin; belge hash'ini cüzdanıyla zaman damgalı bir Devnet kaydına bağlayabilsin.** AutoTrace hangi raporun doğru olduğuna karar vermez.

## Kullanıcı ve varsayım

İlk kullanıcı adayı, satın alma öncesi birden fazla ekspertiz raporu gören ikinci el araç alıcısıdır. İlk test: iki rapor sunup çelişkiyi bulmanın alıcıya yarar sağlayıp sağlamadığını 5 alıcıyla görüşerek öğrenmek. Henüz ekspertiz firması, sigorta şirketi, SBM veya servis entegrasyonu yoktur; bunları varmış gibi anlatma.

## Neden Solana?

Bir raporun SHA-256 özeti Phantom ile imzalanmış Memo işlemine eklenir. Böylece alıcı rapor dosyasını daha sonra yeniden hash'leyip herkese açık Devnet işlemiyle karşılaştırabilir. Zincirde açık plaka, VIN, PDF veya kişisel bilgi bulunmaz; işlemi imzalayan cüzdan adresi ise Solana'da herkese açık olur. Bu MVP özel program değil, Solana'nın mevcut Memo programını kullanır.

## Dürüst sınırlar

- Şu an karşılaştırma metin alanlarını kural tabanlı eşleştirir; model/LLM kararı vermez.
- Metin tabanlı PDF ve TXT okunur; fotoğraf taraması yapılmış PDF'lerde OCR yoktur.
- İhraççı/ekspertiz firması kimliği henüz doğrulanmıyor. İmza, kaydı yazan cüzdanı gösterir; gerçek dünyada o kişinin yetkisini göstermez.
- Hash, dosyanın birebir aynı olduğunu kanıtlar; belge içeriğinin veya araç durumunun doğru olduğunu kanıtlamaz.
- Dashboard örnekleri sentetik. Devnet kaydı her kullanıcı işlemi için Phantom onayı ister.

## 27–29 Kasım build sprinti için açık işler

1. 5 ikinci el alıcıyla kısa problem görüşmesi yap; izin olmadan ses/kayıt alma ve kullanıcı verisini ürüne koyma.
2. İki güvenilir format için alan şemasını netleştir; eksik alanı “doğrulandı” sayma.
3. Devnet akışını Phantom test cüzdanıyla göster; gerçek işlem imzasını Explorer'da aç.
4. İmkân varsa bir ekspertiz uzmanından anonim/sentetik rapor şablonu ve kaynak doğrulama akışı hakkında geri bildirim al.
5. Kuruluş imzalama ve yetkili paylaşım bağlantısını sonraki sürüm hedefi olarak tanımla; teslimde tamamlanmış gibi anlatma.
6. Hackathon başlangıcından itibaren yapılan kod ve ekip katkılarını gün gün kaydet; teslimde etkinlik öncesi arayüz/prototip çalışmasını açıkla.

## 90 saniyelik demo sırası

1. **Sentetik PDF A/B’yi yükle ve karşılaştır** düğmesine bas: alanlar tarayıcıda çıkarılır.
2. “Kaput” farkını göster; hüküm değil uyarı verdiğini söyle.
3. PDF A'nın hash'ini cihazda hesapla; dosyanın gönderilmediğini belirt.
4. Devnet Memo'ya hash'i Phantom onayıyla yaz ve işlem imzasını Explorer'da aç.
5. Aynı PDF'yi işlem imzasıyla yeniden doğrula; PDF B'yi seçip eşleşmediğini göster.

## Başarı sinyalleri

- Demo sırasında 1 gerçek, onaylı Devnet işlem imzası.
- 5 alıcıdan en az 3'ünün rapor çelişkisini satın alma kararında yararlı bulması.
- Bir ekspertiz uzmanından, kuruluş kimliğinin nasıl doğrulanacağına dair net bir sonraki adım.

Bunlar hedef/hipotezdir; henüz elde edilmiş sonuç değildir.
