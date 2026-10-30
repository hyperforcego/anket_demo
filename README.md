# Kombin Anketi

Okazyon bazlı kombin oluşturma anketi (tek dosya: `index.html`).

## GitHub Pages'te yayınlama
1. GitHub'da yeni bir repo oluştur (ör. `kombin-anketi`), bu klasördeki tüm dosyaları yükle.
2. Repo > Settings > Pages > Source: **Deploy from a branch**, Branch: **main** / **(root)** > Save.
3. 1-2 dakika sonra adres hazır: `https://KULLANICI-ADIN.github.io/kombin-anketi/`

## Yanıtları toplama
`apps-script/Code.gs` dosyasındaki adımları izle, çıkan `/exec` adresini `index.html` içindeki
`const ENDPOINT = "";` satırına yapıştırıp dosyayı GitHub'da güncelle.

## Google Sites'a gömme
Ekle > Yerleştir > **URL ile** sekmesine Pages adresini yapıştır.

> Not: Pages herkese açıktır; `index.html` içindeki ENDPOINT ve SECRET görülebilir. Apps Script tarafında
> yalnızca tabloya satır ekleniyor, bu yüzden risk düşüktür.
