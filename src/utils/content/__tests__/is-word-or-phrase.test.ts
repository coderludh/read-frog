// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { countTokens, isWordOrPhrase } from "../is-word-or-phrase"

describe("countTokens", () => {
  it("counts English words separated by spaces", () => {
    expect(countTokens("hello")).toBe(1)
    expect(countTokens("hello world")).toBe(2)
    expect(countTokens("run up hill")).toBe(3)
  })

  it("counts hyphenated compounds as one token", () => {
    expect(countTokens("up-to-date")).toBe(1)
    expect(countTokens("well-known")).toBe(1)
  })

  it("counts each CJK character as one token", () => {
    expect(countTokens("运行")).toBe(2)
    expect(countTokens("书")).toBe(1)
    expect(countTokens("很高兴")).toBe(3)
  })

  it("counts mixed CJK-and-Latin text correctly", () => {
    expect(countTokens("run 运行")).toBe(3) // 1 Latin + 2 CJK chars
    expect(countTokens("很好 hello")).toBe(3) // 2 CJK + 1 Latin-token
  })

  it("counts Japanese kana as individual tokens", () => {
    expect(countTokens("こんにちは")).toBeGreaterThanOrEqual(5)
    expect(countTokens("読む")).toBe(2)
  })

  it("counts Korean hangul as individual tokens", () => {
    expect(countTokens("안녕하세요")).toBeGreaterThanOrEqual(5)
  })

  it("handles empty string", () => {
    expect(countTokens("")).toBe(0)
  })

  it("handles whitespace-only string", () => {
    expect(countTokens("   ")).toBe(0)
  })
})

describe("isWordOrPhrase", () => {
  it("returns true for a single English word", () => {
    expect(isWordOrPhrase("run")).toBe(true)
    expect(isWordOrPhrase("book")).toBe(true)
    expect(isWordOrPhrase("set off")).toBe(true)
  })

  it("returns true for a three-word phrase", () => {
    expect(isWordOrPhrase("look up to")).toBe(true)
    expect(isWordOrPhrase("in front of")).toBe(true)
  })

  it("returns false for strings with 4+ tokens", () => {
    expect(isWordOrPhrase("I am running home")).toBe(false)
    expect(isWordOrPhrase("run up hill fast")).toBe(false)
  })

  it("returns false for strings with sentence-ending punctuation", () => {
    expect(isWordOrPhrase("run!")).toBe(false)
    expect(isWordOrPhrase("I am running.")).toBe(false)
    expect(isWordOrPhrase("你好吗？")).toBe(false)
    expect(isWordOrPhrase("Hello world;")).toBe(false)
  })

  it("returns false for multi-line selections", () => {
    expect(isWordOrPhrase("hello\nworld")).toBe(false)
  })

  it("returns false for null, undefined, or empty", () => {
    expect(isWordOrPhrase(null)).toBe(false)
    expect(isWordOrPhrase(undefined)).toBe(false)
    expect(isWordOrPhrase("")).toBe(false)
    expect(isWordOrPhrase("   ")).toBe(false)
  })

  it("returns true for a single CJK character", () => {
    expect(isWordOrPhrase("书")).toBe(true)
    expect(isWordOrPhrase("学习")).toBe(true)
    expect(isWordOrPhrase("打电话")).toBe(true)
  })

  it("handles punctuation within a phrase (not terminal)", () => {
    expect(isWordOrPhrase("world-class")).toBe(true)
    expect(isWordOrPhrase("state-of-the-art")).toBe(true)
    expect(isWordOrPhrase("he's")).toBe(true)
  })
})
