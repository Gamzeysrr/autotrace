# Demo akışı

1. Yerel sunum için `AutoTrace-Open.bat` dosyasını aç. Çevrimiçi Vercel sürümünde aynı API akışı Neon Postgres kullanır.
2. Giriş yapmadan bir örnek VIN seç veya 17 karakterli VIN ile arama yap. Arama herkese açıktır.
3. **Kurum başvurusu** sayfasında sentetik kurum ve kullanıcı oluştur. Bu başvuru kendiliğinden kayıt yetkisi vermez.
4. Bu bilgisayarda yerel olarak tanımlanmış AutoTrace yönetici hesabıyla gir, **Başvuru onayı** ekranında başvuruyu onayla.
5. Başvuru sahibi e-posta ve belirlediği şifreyle giriş yapar. Kurum tipi hangi rapor türlerini gönderebileceğini belirler.
6. Raporu ekle. Sunucu onaylı kullanıcıyı kontrol eder ve raporu veritabanına yazar. Vercel sürümünde bu kayıt Neon Postgres'te kalıcı tutulur; başka tarayıcı oturumundan aynı VIN sorgulanınca görünür.
7. Rapor yayımlanması için Phantom işlemini Solana Devnet'te onayla. Sunucu işlem imzasını, Memo'yu ve rapor hash'ini Devnet RPC'sinden doğrular; eşleşme yoksa kayıt VIN aramasında görünmez. Phantom cüzdanı demo kurum kullanıcısını temsil etmez.

## Hazır örnek hesaplar

- Sigorta: `sigorta@ufuk-sigorta.test` / `UfukDemo2026!`
- Ekspertiz: `ekspertiz@mercek-ekspertiz.test` / `MercekDemo2026!`
- Servis: `servis@rota-otomotiv.test` / `RotaDemo2026!`

Bütün hazır hesaplar ve senaryo verileri sentetiktir. Canlı kurum verisi entegrasyonu yoktur. Vercel sürümünün canlı çalışması için Neon Postgres'i projeye bağlamak ve `AUTOTRACE_ADMIN_EMAIL` ile `AUTOTRACE_ADMIN_PASSWORD` değişkenlerini ayarlamak gerekir.
