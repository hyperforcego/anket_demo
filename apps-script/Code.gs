/**
 * KOMBİN ANKETİ — Google Sheets + Google Drive'a kayıt (Google Apps Script)
 * ------------------------------------------------------------------------
 * KURULUM / GÜNCELLEME
 *  1) Tabloyu aç: Uzantılar > Apps Komut Dosyası. Editördeki her şeyi silip bu kodu yapıştır, kaydet.
 *  2) (İsteğe bağlı) SECRET'a rastgele bir şifre yaz; HTML'deki SECRET ile aynı olmalı.
 *  3) Drive izni için (sadece bir kez): fonksiyon seçiciden "izinVer"i seç > Çalıştır > izinleri onayla.
 *  4) Dağıt > Dağıtımları yönet > kalem simgesi > Sürüm: "Yeni sürüm" > Dağıt.
 *     (İlk kurulumsa: Dağıt > Yeni dağıtım > Web uygulaması, Yürütme: Ben, Erişim: Herkes.)
 *  5) Çıkan /exec adresini HTML'deki ENDPOINT = "" içine yapıştır.
 *
 * NE YAPAR
 *  - Her "Kaydet"te "Yanitlar" sekmesine bir satır yazar/günceller (aynı katılımcı aynı okazyonu tekrar kaydederse günceller).
 *  - Her katılımcının 5 karakterlik bir KODU (code) ve cinsiyeti (gender) vardır; isim tutulmaz.
 *  - Anket bitince 5 kombinin özet görselini Drive'daki "Kombin Anketi Görselleri" klasörüne "KOD_tarih.png" adıyla
 *    kaydeder (kod görselin sağ üst köşesinde de yazar) ve linki o katılımcının satırlarındaki "imageUrl" sütununa yazar.
 *  - Sütun yapısı değiştiği için eski "Yanitlar" sekmesi varsa otomatik olarak "Yanitlar_eski_..." adıyla saklanır,
 *    yeni sekme sıfırdan açılır (silinmez).
 *  - Tarayıcıda /exec adresini açınca "OK" görüyorsan dağıtım çalışıyor demektir.
 */

const SECRET = "";
const SHEET_NAME = "Yanitlar";
const FOLDER_NAME = "Kombin Anketi Görselleri";
const COLUMNS = [
  "savedAt", "code", "gender", "order", "occasionId", "occasion",
  "topId", "topName", "bottomId", "bottomName", "note", "durationSec", "imageUrl", "sessionId"
];

function doGet() {
  return ContentService.createTextOutput("OK");
}

// Drive iznini tek seferlik istemek için editörden çalıştır
function izinVer() {
  DriveApp.getRootFolder();
  SpreadsheetApp.getActiveSpreadsheet();
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (SECRET && data.secret !== SECRET) return json_({ ok: false, error: "unauthorized" });
    if (data.type === "image") return saveImage_(data);
    return saveRow_(data);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (sh) {
    // sütunlar şu anki yapıyla uyuşmuyorsa eski sekmeyi sakla, yenisini aç
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0].join("|");
    if (sh.getLastRow() > 0 && header !== COLUMNS.join("|")) {
      const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmm");
      sh.setName(SHEET_NAME + "_eski_" + stamp);
      sh = null;
    }
  }
  if (!sh) {
    sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function saveRow_(data) {
  const sh = getSheet_();
  const row = COLUMNS.map(function (c) { return data[c] === undefined ? "" : data[c]; });
  const last = sh.getLastRow();
  let target = 0;
  if (last > 1) {
    const vals = sh.getRange(2, 1, last - 1, COLUMNS.length).getValues();
    const iS = COLUMNS.indexOf("sessionId"), iO = COLUMNS.indexOf("occasionId"), iI = COLUMNS.indexOf("imageUrl");
    for (let i = 0; i < vals.length; i++) {
      if (vals[i][iS] === data.sessionId && vals[i][iO] === data.occasionId) {
        target = i + 2;
        if (!row[iI]) row[iI] = vals[i][iI]; // mevcut görsel linkini koru
        break;
      }
    }
  }
  if (target) sh.getRange(target, 1, 1, COLUMNS.length).setValues([row]);
  else sh.appendRow(row);
  return json_({ ok: true });
}

function saveImage_(data) {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
  const code = String(data.code || "KODSUZ").replace(/[^A-Za-z0-9-]+/g, "").slice(0, 20) || "KODSUZ";
  const day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HHmm");
  const blob = Utilities.newBlob(Utilities.base64Decode(data.imageBase64), "image/png", code + "_" + day + ".png");
  const file = folder.createFile(blob);
  const url = file.getUrl();

  // aynı katılımcının tüm satırlarına link yaz
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last > 1) {
    const iS = COLUMNS.indexOf("sessionId"), iI = COLUMNS.indexOf("imageUrl") + 1;
    const ids = sh.getRange(2, iS + 1, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === data.sessionId) sh.getRange(i + 2, iI).setValue(url);
    }
  }
  return json_({ ok: true, url: url });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
