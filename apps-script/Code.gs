/**
 * KOMBİN ANKETİ — Google Sheets'e kayıt (Google Apps Script)
 * ---------------------------------------------------------
 * KURULUM (yaklaşık 3 dakika)
 *  1) sheets.google.com'da boş bir e-tablo oluştur (ör. "Kombin Anketi Yanıtları").
 *  2) Menü: Uzantılar > Apps Script. Açılan editördeki her şeyi silip bu kodu yapıştır.
 *  3) Aşağıdaki SECRET'a rastgele bir şifre yaz (HTML'deki SECRET ile aynı olacak). İstersen boş bırak.
 *  4) Sağ üst: Dağıt > Yeni dağıtım > Tür: "Web uygulaması"
 *       - Yürütme kimliği:  Ben (e-posta adresin)
 *       - Erişimi olanlar:  Herkes
 *     "Dağıt"a bas, izinleri onayla ("Gelişmiş > ... güvenli değil" uyarısı kendi kodun olduğu için normaldir).
 *  5) Çıkan "Web uygulaması URL'si"ni (…/exec ile biter) kopyala ve HTML dosyasındaki ENDPOINT = "" içine yapıştır.
 *  6) Kodu sonradan değiştirirsen: Dağıt > Dağıtımları yönet > düzenle > Yeni sürüm. (URL aynı kalır)
 *
 * ÇALIŞMA MANTIĞI
 *  - Her "Kaydet"te bir satır yazılır. Aynı katılımcı aynı okazyonu tekrar kaydederse satır GÜNCELLENİR (çift kayıt olmaz).
 *  - Tarayıcıda aşağıdaki URL'yi açınca "OK" görüyorsan dağıtım çalışıyor demektir.
 */

const SECRET = "";            // HTML'deki SECRET ile aynı olmalı. Boşsa kontrol yapılmaz.
const SHEET_NAME = "Yanitlar";
const COLUMNS = [
  "savedAt", "sessionId", "participant", "order", "occasionId", "occasion",
  "topId", "topName", "bottomId", "bottomName", "note", "durationSec"
];

function doGet() {
  return ContentService.createTextOutput("OK");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // aynı anda gelen kayıtlar sıraya girsin
  try {
    const data = JSON.parse(e.postData.contents);
    if (SECRET && data.secret !== SECRET) {
      return json_({ ok: false, error: "unauthorized" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(COLUMNS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    }

    const row = COLUMNS.map(function (c) { return data[c] === undefined ? "" : data[c]; });

    // upsert: sessionId + occasionId aynıysa güncelle
    const last = sh.getLastRow();
    let target = 0;
    if (last > 1) {
      const keys = sh.getRange(2, 1, last - 1, COLUMNS.length).getValues();
      const iS = COLUMNS.indexOf("sessionId"), iO = COLUMNS.indexOf("occasionId");
      for (let i = 0; i < keys.length; i++) {
        if (keys[i][iS] === data.sessionId && keys[i][iO] === data.occasionId) { target = i + 2; break; }
      }
    }
    if (target) sh.getRange(target, 1, 1, COLUMNS.length).setValues([row]);
    else sh.appendRow(row);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
