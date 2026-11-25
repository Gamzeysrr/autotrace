# AutoTrace — 90 saniyelik demo akışı

1. **Problem (15 sn):** “Alıcı, araca ait kaza ve ekspertiz kayıtlarını farklı yerlerde görüyor; raporun kaynağına ve sonradan değiştirilip değiştirilmediğine güvenmekte zorlanıyor.”
2. **VIN sorgusu (20 sn):** Araç Geçmişi sayfasındaki sentetik VIN `ATDEMO2021SEDAN01` ile arama yap. 2022–2026 arasına yayılmış örnek sigorta, ekspertiz ve servis kayıtlarını göster.
3. **Çelişki (15 sn):** Eski hasar kaydında “kaput: işlem yok”, ekspertiz kaydında “kaput: boyalı” bilgisini aç. “Sistem çelişkiyi işaretliyor; hangi raporun doğru olduğuna hükmetmiyor.”
4. **Kurum kaydı (15 sn):** Kurum Kaydı Oluştur sayfasında sentetik VIN, rapor numarası ve kısa bir kayıt özeti gir. İsteğe bağlı PDF'nin yalnızca hash'i tarayıcıda hesaplanır. Yeni kayıt yalnızca bu tarayıcıya kaydedilir.
5. **Solana (20 sn):** Kaydın hash'ini Phantom ile Devnet Memo işlemine yaz. Cüzdandaki Memo'da yalnızca uygulama etiketi ve SHA-256 özeti bulunur; VIN veya rapor içeriği gitmez. Explorer işlem sayfasını aç.
6. **Kapanış (5 sn):** “AutoTrace; yetkili kurum kayıtlarını VIN'e bağlayıp kaynağı ve bütünlüğü izlenebilir kılmayı hedefliyor. Bu prototipte kurum entegrasyonu sentetik olarak temsil ediliyor.”

## Sunumda açıkça belirt

- Araç, kurum, rapor ve olay örneklerinin tamamı sentetik; gerçek sigorta, kamu, servis veya ekspertiz bağlantısı yok.
- Kurum seçimi demodur; kayıt göndereni gerçek kurum olarak doğrulamaz ve gerçek kurumsal imza üretmez.
- Form kayıtları sadece tarayıcı `localStorage` alanında saklanır. Ortak backend/veritabanı yoktur.
- Blockchain hash'i sonradan dosya değişikliğini kontrol etmeye yarar; raporun ilk bilgisinin doğru olduğunu kanıtlamaz.
- Solana Devnet işlemi sadece SHA-256 hash'i taşır; VIN, plaka ve belge zincire gönderilmez. İşlem imzalayan cüzdan adresi herkese açık olur.
- UI / prototip çalışmaları etkinlik öncesiyse, hackathon kurallarına uygun biçimde bunu ve build sprintindeki yeni katkıları ayır.

## Hazırlık

- Yerel demo için `AutoTrace-Open.bat` çalıştır; `http://127.0.0.1:4173/` adresinde açılır.
- Zincire hash yazacaksan Phantom'da Solana Devnet ve yeterli test SOL bulunduğunu kontrol et. İşlemi cüzdanda inceleyip kendin onayla.
- Örnek VIN dışında gerçek araç VIN'i girme.
