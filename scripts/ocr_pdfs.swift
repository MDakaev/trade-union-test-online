#!/usr/bin/env swift
import AppKit
import Foundation
import PDFKit
import Vision

let cwd = FileManager.default.currentDirectoryPath
let outDir = cwd + "/extracted"
try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

let targets = [
  "Клизмы.pdf",
  "Постановка компресса.pdf",
  "нательного белья)..pdf",
  "волосами. Кормление. Пролежни)..pdf",
  "Оксигенотерапия.pdf",
]

func render(_ page: PDFPage) -> CGImage? {
  let bounds = page.bounds(for: .mediaBox)
  let scale: CGFloat = 2.0
  let size = NSSize(width: bounds.width * scale, height: bounds.height * scale)
  let image = NSImage(size: size)
  image.lockFocus()
  if let ctx = NSGraphicsContext.current?.cgContext {
    ctx.setFillColor(NSColor.white.cgColor)
    ctx.fill(CGRect(origin: .zero, size: size))
    ctx.saveGState()
    ctx.translateBy(x: 0, y: size.height)
    ctx.scaleBy(x: scale, y: -scale)
    page.draw(with: .mediaBox, to: ctx)
    ctx.restoreGState()
  }
  image.unlockFocus()
  var rect = NSRect(origin: .zero, size: size)
  return image.cgImage(forProposedRect: &rect, context: nil, hints: nil)
}

func ocr(_ image: CGImage) -> String {
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.recognitionLanguages = ["ru-RU", "en-US"]
  request.usesLanguageCorrection = true
  let handler = VNImageRequestHandler(cgImage: image, options: [:])
  try? handler.perform([request])
  let observations = (request.results ?? []).sorted {
    $0.boundingBox.minY > $1.boundingBox.minY
  }
  return observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
}

for name in targets {
  let url = URL(fileURLWithPath: cwd + "/" + name)
  guard let doc = PDFDocument(url: url) else {
    print("SKIP missing \(name)")
    continue
  }
  var pages: [String] = []
  var ocrCount = 0
  for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let embedded = (page.string ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
    if embedded.count >= 40 {
      pages.append(embedded)
      continue
    }
    if let cg = render(page) {
      let text = ocr(cg)
      pages.append(text.isEmpty ? "[OCR_EMPTY page \(i + 1)]" : text)
      ocrCount += 1
    } else {
      pages.append("[OCR_RENDER_FAIL page \(i + 1)]")
    }
  }
  let out = outDir + "/" + name + ".txt"
  try! pages.joined(separator: "\n\n---PAGE BREAK---\n\n").write(toFile: out, atomically: true, encoding: .utf8)
  let chars = pages.joined().count
  print("OK \(name) pages=\(doc.pageCount) ocrPages=\(ocrCount) chars=\(chars)")
}
print("DONE")
