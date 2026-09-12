/* eslint-disable */
// scripts/patch-fontkit-getvariation.cjs
// POSTINSTALL PATCH: Sửa fontkit/index.js getVariation() không throw với non-variable fonts.
const fs = require("node:fs");
const path = require("node:path");

const FONTKIT_INDEX = path.join(__dirname, "..", "node_modules", "fontkit", "index.js");
if (!fs.existsSync(FONTKIT_INDEX)) {
  console.log("[patch-fontkit] ⚠ Không tìm thấy node_modules/fontkit/index.js → skip");
  process.exit(0);
}

let src = fs.readFileSync(FONTKIT_INDEX, "utf8");

// Kiểm tra đã patch chưa
const ALREADY_PATCHED_MARKER = "// [web-tuanson-patched] Non-variable fonts return self";
if (src.includes(ALREADY_PATCHED_MARKER)) {
  console.log("[patch-fontkit] ✅ Đã patch trước đó → skip");
  process.exit(0);
}

const NEEDLE = "throw new Error('Variations require a font with the fvar, gvar and glyf, or CFF2 tables.');";
const idx = src.indexOf(NEEDLE);
if (idx === -1) {
  console.log("[patch-fontkit] ❌ Không tìm thấy dòng throw cần patch. Fontkit version khác?");
  process.exit(1);
}

const REPLACEMENT = "return this; // [web-tuanson-patched] Non-variable fonts return self instead of throwing";
const before = src.slice(0, idx);
const after = src.slice(idx + NEEDLE.length);
const out = before + REPLACEMENT + after;

fs.writeFileSync(FONTKIT_INDEX, out);
console.log("[patch-fontkit] ✅ Patch thành công. File:", FONTKIT_INDEX);
console.log("[patch-fontkit] ✅ Non-variable font giờ return this thay vì throw, giúp PDFKit tạo PDF tiếng Việt thành công.");
