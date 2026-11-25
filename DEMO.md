# AutoTrace — kısa demo akışı

1. **Araç Geçmişi** sayfasında Ön hasar, Dolu hasarı veya Arka hasar senaryosunu seç. Kayıtları kronolojik sırada ve kaynak türüyle göster.
2. Dikkat gerektiren senaryolarda farklı tarih/kaynak kayıtlarını anlat. Uygulama farkı gösterir; hangi bilginin doğru olduğuna karar vermez.
3. **Kurum kaydı oluştur** sayfasında sentetik olmayan, ancak gerçek kurumdan geldiği doğrulanmayan bir örnek kayıt oluştur. İstersen PDF ekle; yalnızca tarayıcıda hash'i hesaplanır.
4. Phantom'ı Devnet'e bağla ve **Hash'i Solana Devnet'e kaydet** düğmesine bas. Memo içeriğinde yalnızca rastgele kayıt kodu ve tuzlanmış SHA-256 bulunur; VIN/rapor/PDF bulunmaz.
5. JSON doğrulama paketini indir. Pakette VIN ve rapor alanları olabileceği için yalnızca alıcıyla paylaş.
6. **Zincir kanıtını doğrula** sayfasında paketi yükle. Devnet işleminin başarılı olduğunu, Memo'nun paketle eşleştiğini ve imzalayan cüzdan adresini göster.

## Sunumda doğru ifade et

- Zincir kanıtı kayıt bütünlüğünü ve işlemi imzalayan cüzdanı gösterir; gerçek sigorta/ekspertiz şirketini ya da ilk bilginin doğruluğunu kanıtlamaz.
- Üç araç geçmişi sentetik senaryo verisidir; sorgu kodları gerçek VIN değildir.
- Yeni kayıtlar yalnızca bu tarayıcıda saklanır. Ortak veritabanı, issuer allowlist'i ve özel Anchor programı şu an yoktur.
- Bu prototip, rapor hash'ini Solana Devnet'te herkese açık doğrulanabilir bir Memo işlemine bağlar.

Windows'ta `AutoTrace-Open.bat` ile aç. Phantom Devnet ve test SOL gerekir.
