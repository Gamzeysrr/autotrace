# AutoTrace — araç geçmişi güven prototipi

AutoTrace, kaza, sigorta, ekspertiz ve servis kayıtlarını araç geçmişi akışında göstermeyi; kayıtların hangi örnek kurumdan geldiğini ve içerik özetinin Solana Devnet'te sabitlenip sabitlenmediğini incelemeyi amaçlar.

## Kurum yetkilendirme demosu

- Araç araması herkese açıktır. Yeni bir VIN sorgulandığında yalnızca o VIN'e ait kayıtlar API'den döner.
- Rapor gönderimi sunucu tarafında oturum ve kurum durumu kontrolünden geçer. Giriş yapmayan veya AutoTrace onayı bulunmayan kullanıcı `/api/records` üzerinden kayıt ekleyemez.
- Kurum başvurusu otomatik yetki vermez. Başvuruyu AutoTrace demo yöneticisi onayladıktan sonra kullanıcı ve kurum etkinleştirilir.
- Kurum tipleri kayıt türlerini sınırlar: sigorta kaza/hasar kaydı; ekspertiz ekspertiz raporu; servis onarım ve kilometre kaydı gönderebilir.
- Tüm kurumlar, kullanıcılar ve başvurular sentetiktir. Gerçek kişi/kurum bilgisi girmeyin.

## Yerel demo kurulumu

Node.js 22.15 veya üzeri gerekir. Bağımlılık yüklemeden `AutoTrace-Open.bat` dosyasına çift tıklayın. Sunucu `http://127.0.0.1:4177/` adresinde başlar ve SQLite veritabanını `data/autotrace.sqlite` içinde tutar. Başlatıcı Node.js'e Windows sistem sertifika deposunu da kullandırır; böylece Devnet RPC TLS doğrulaması yapılabilir.

### Sentetik demo hesapları

| Kullanıcı | E-posta | Şifre |
|---|---|---|
| Örnek Ufuk Sigorta | `sigorta@ufuk-sigorta.test` | `UfukDemo2026!` |
| Örnek Mercek Ekspertiz | `ekspertiz@mercek-ekspertiz.test` | `MercekDemo2026!` |
| Örnek Rota Servis Merkezi | `servis@rota-otomotiv.test` | `RotaDemo2026!` |

Giriş ekranındaki hazır kurum hesabı düğmeleri alanları doldurur. AutoTrace yönetici hesabı bu bilgisayarda yerel olarak yapılandırılır; kaynak dosyalara ve paketlere eklenmez. Yeni başvuru akışında yöneticiyle giriş yapıp başvuruyu onayladıktan sonra başvuru sahibi kendi bilgileriyle giriş yapıp kayıt gönderebilir.

## Örnek araç senaryoları

- Ön hasar: `ATQ23A1B000000001`
- Dolu hasarı: `ATQ24C2D000000002`
- Arka hasar: `ATQ20E3F000000003`

Bu kodlar gerçek VIN değildir; yalnızca ürün akışını göstermek için hazırlanmış sentetik senaryolardır.

## Solana Devnet kanıtı

Raporu yayımlamak için Phantom ile hash'i Solana Devnet Memo'suna yazmak zorunludur. Sunucu Devnet `getTransaction` RPC çağrısıyla işlem onayını, Memo programını, kayıt kimliğini ve SHA-256 özetini doğrular; bunlar eşleşmeden rapor veritabanına eklenmez ve VIN aramasında görünmez. Memo yalnızca rastgele kayıt kimliği ve tuzlanmış SHA-256 içerir; VIN ve rapor içeriği zincire yazılmaz. Memo işlemini kurumun kayıtlı cüzdanı değil, tarayıcıdaki kullanıcının seçtiği Phantom cüzdanı imzalar. Bu imza kurumsal kimlik kanıtı sayılmaz.

Phantom yoksa rapor yayımlanmaz ve VIN aramasında görünmez. Phantom'u kurup sayfayı yenile, kurum hesabıyla yeniden giriş yap ve rapor formunu tekrar gönder.

Devnet kanıt dosyası, rapor içeriğini ve VIN'i içerebilir; yalnızca paylaşım izni olan kişiye gönderin.

## Vercel ve kalıcı veritabanı

Vercel için `/api/*` uç noktaları `api/[...path].js` üzerinden çalışır ve ortak, kalıcı veritabanı olarak Postgres kullanır. Sunucu SQLite dosyasına Vercel üzerinde yazmaya çalışmaz. Yerel bilgisayardaki `server.js` SQLite ile çalışmaya devam eder.

1. Vercel’de projeye **Storage → Marketplace Storage → Neon Postgres** entegrasyonunu bağla. Vercel bağlantı bilgilerini `DATABASE_URL` olarak ekler. Marketplace depolama sağlayıcısını ve olası ücretleri Vercel hesabından yönetir; plandaki ücretleri kontrol et.
2. Vercel Project Settings → Environment Variables bölümüne `AUTOTRACE_ADMIN_EMAIL` ve `AUTOTRACE_ADMIN_PASSWORD` ekle. Bunlar yalnızca sunucu ortamında tutulmalı; GitHub’a veya tarayıcıya yazılmamalı. Yönetici ilk API çağrısında oluşturulur. Parola sonradan değiştirilirse mevcut hesap otomatik değişmez.
3. `main` dalını yeniden dağıt. `/api/health` yanıtında `mode: "vercel-postgres"` görünmesi veritabanının bağlandığını gösterir.

Postgres tabloları ilk API çağrısında oluşturulur. Demo kurum hesapları sentetik olarak eklenir; kurum başvuruları, onay durumu, oturumlar ve Solana doğrulamalı raporlar kalıcı Postgres tablolarında tutulur. Yerel admin ayarı ve `data/` klasörü depoya gönderilmez. Gerekli değişkenler `.env.example` içinde listelenmiştir.

Bu, gerçek kurumlara bağlı ticari bir araç sicili değildir. Kurum doğrulaması admin onayıyla sınırlıdır; örnek şirket hesapları sentetiktir. Üretim için gerçek kurum kimliği ve e-posta doğrulaması, kurum cüzdanlarının bağlanması, veri gizliliği/erişim politikaları ve yedekleme gerekir. Özel Anchor programı/PDA kaydı yoktur; Solana Memo içerik özetinin sonradan değişmediğine kanıt verir, raporun ilk günden doğru olduğunu kanıtlamaz. VIN ve rapor içeriği zincire yazılmaz.

## Teknik

Ön yüz tek HTML/CSS/JavaScript uygulamasıdır. Yerel backend Node.js `http`, `crypto` ve `node:sqlite` kullanır; Vercel backend'i Node.js serverless function ve `@neondatabase/serverless` ile Postgres kullanır. Oturum çerezi HttpOnly/SameSite, parolalar scrypt hash olarak tutulur. Veritabanı kimlik bilgileri ortam değişkenlerindedir.
