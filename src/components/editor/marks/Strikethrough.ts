import Mark from "./Mark";
import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";

export default class Strikethrough extends Mark {
  get name() {
    return "strikethrought";
  }

  get schema() {
    return {
      parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }],
      toDOM: () => ["del", 0],
    };
  }

  keys({ type }) {
    return {
      "Mod-d": toggleMark(type),
    };
  }

  inputRules({ type }) {
    return [markInputRule(/~([^~]+)~$/, type)];
  }

  get toMarkdown() {
    return {
      open: "~~",
      close: "~~",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  get markdownToken() {
    return "s";
  }

  parseMarkdown() {
    return { mark: "strikethrough" };
  }
}
