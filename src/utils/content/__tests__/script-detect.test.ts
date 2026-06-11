// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { isTextInTargetLanguageScript } from "../script-detect"

describe("isTextInTargetLanguageScript", () => {
  describe("chinese (cmn)", () => {
    it("returns true for Chinese text", () => {
      expect(isTextInTargetLanguageScript("你好世界", "cmn")).toBe(true)
    })

    it("returns true for mixed text with >50% Chinese", () => {
      expect(isTextInTargetLanguageScript("你好世界a", "cmn")).toBe(true)
    })

    it("returns false for mixed text with <50% Chinese", () => {
      expect(isTextInTargetLanguageScript("hello你好", "cmn")).toBe(false)
    })

    it("returns false for English text", () => {
      expect(isTextInTargetLanguageScript("hello world", "cmn")).toBe(false)
    })

    it("returns true for single Chinese character", () => {
      expect(isTextInTargetLanguageScript("书", "cmn")).toBe(true)
    })

    it("ignores whitespace", () => {
      expect(isTextInTargetLanguageScript("你 好", "cmn")).toBe(true)
    })

    it("returns true for cmn-Hant (Traditional Chinese)", () => {
      expect(isTextInTargetLanguageScript("繁體字", "cmn-Hant")).toBe(true)
    })
  })

  describe("japanese (jpn)", () => {
    it("returns true for Japanese with kanji", () => {
      expect(isTextInTargetLanguageScript("日本語", "jpn")).toBe(true)
    })

    it("returns true for Japanese with hiragana", () => {
      expect(isTextInTargetLanguageScript("こんにちは", "jpn")).toBe(true)
    })

    it("returns true for Japanese with katakana", () => {
      expect(isTextInTargetLanguageScript("カタカナ", "jpn")).toBe(true)
    })

    it("returns false for English text", () => {
      expect(isTextInTargetLanguageScript("hello", "jpn")).toBe(false)
    })
  })

  describe("korean (kor)", () => {
    it("returns true for Korean text", () => {
      expect(isTextInTargetLanguageScript("안녕하세요", "kor")).toBe(true)
    })

    it("returns false for English text", () => {
      expect(isTextInTargetLanguageScript("hello", "kor")).toBe(false)
    })
  })

  describe("latin-script languages (eng, fra, spa)", () => {
    it("returns false for English target — can't detect by Unicode", () => {
      expect(isTextInTargetLanguageScript("hello", "eng")).toBe(false)
    })

    it("returns false for French target — can't detect by Unicode", () => {
      expect(isTextInTargetLanguageScript("bonjour", "fra")).toBe(false)
    })
  })

  describe("russian (rus)", () => {
    it("returns true for Russian text", () => {
      expect(isTextInTargetLanguageScript("Привет", "rus")).toBe(true)
    })

    it("returns false for English text", () => {
      expect(isTextInTargetLanguageScript("hello", "rus")).toBe(false)
    })
  })

  describe("edge cases", () => {
    it("returns false for empty string", () => {
      expect(isTextInTargetLanguageScript("", "cmn")).toBe(false)
    })

    it("returns false for whitespace-only string", () => {
      expect(isTextInTargetLanguageScript("   ", "cmn")).toBe(false)
    })

    it("returns false for unknown target language", () => {
      expect(isTextInTargetLanguageScript("hello", "eng")).toBe(false)
    })
  })
})
