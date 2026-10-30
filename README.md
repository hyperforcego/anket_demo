# Kombin Anketi

Okazyon bazlı kombin oluşturma anketi.

## Klasör yapısı
```
index.html          sayfanın kendisi (ayarlar dosyanın başındaki AYARLAR bölümünde)
gorseller/
  MODEL.png         manken
  T1.png, G1.png    üst giyim
  E6.png, P3.png    alt giyim
apps-script/Code.gs Google Sheets + Drive kaydı için Apps Script (GitHub'da çalışmaz, yedek)
.nojekyll
```

## Yeni kıyafet ekleme
1. PNG'yi `gorseller/` klasörüne yükle. Manken görseliyle AYNI boyutta ve aynı çerçeveden olmalı.
   (Düz gri arka planlı render'lar otomatik şeffaflaştırılır; şeffaf PNG de olur.)
2. `index.html` içinde `CATALOG` listesine bir satır ekle:
   `{ id: "T2", cat: "top", name: "Beyaz Bluz", sub: "V yaka", file: "gorseller/T2.png" },`
   `cat` değeri `"top"` (üst giyim) ya da `"bottom"` (alt giyim) olur.

Dosya adları büyük/küçük harfe duyarlıdır: `T1.png` ile `t1.png` farklı dosyalardır.

## Elbise kuralı (alt giyimsiz kayıt)
`CATALOG` içinde `bottomOptional: true` yazan parçalarla (D1, D2, D3, D3V2, D4, D5, D6) alt giyim seçmeden de
kaydedilebilir. Bu durumda kayda `bottomId = YOK`, `bottomName = Alt giyim yok` yazılır. Diğer üst giyimlerde alt giyim
zorunludur. Başka bir parçaya bu istisnayı vermek için satırına `bottomOptional: true` eklemek yeter.

## Yanıtları toplama
`apps-script/Code.gs` içindeki kurulum adımlarını izle, çıkan `/exec` adresini `index.html` içindeki
`const ENDPOINT = "";` satırına yapıştır.

## Katılımcı kodu ve cinsiyet (güncelleme)

- Giriş sayfasında isim alanı yok; **Kadın / Erkek seçimi zorunlu**.
- Her anket başlatıldığında otomatik **5 karakterlik kod** üretilir (örn. `JHY6J`; 0/O, 1/I/L gibi karışan karakterler kullanılmaz).
- Kod her satıra `code` sütunu olarak, cinsiyet `gender` sütunu olarak yazılır; Drive'daki özet görselin **sağ üst köşesinde** ve dosya adında (`JHY6J_2026-10-30_1530.png`) yer alır. Görseldeki kodu tabloda `code` sütununda arayarak eşleştirirsin.
- Güncelleme: `apps-script/Code.gs` içeriğini Apps Script'e yapıştır > Dağıt > Dağıtımları yönet > Yeni sürüm. Sütunlar değiştiği için eski "Yanitlar" sekmesi otomatik olarak `Yanitlar_eski_...` adıyla saklanır, yeni sekme açılır. Sonra `index.html`'i GitHub'a yükle (ENDPOINT'i yeniden yaz).
