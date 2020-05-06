import Mark from "./Mark";
import markInputRule from "../lib/markInputRule";
import { toggleMark } from "prosemirror-commands";

function backticksFor(node, side) {
  const ticks = /`+/g;
  let match: RegExpMatchArray;
  let len = 0;

  if (node.isText) {
    while ((match = ticks.exec(node.text))) {
      len = Math.max(len, match[0].length);
    }
  }

  let result = len > 0 && side > 0 ? " `" : "`";
  for (let i = 0; i < len; i++) {
    result += "`";
  }

  if (len > 0 && side < 0) {
    result += " ";
  }

  return result;
}

export default class Code extends Mark {
  get name() {
    return "code_inline";
  }

  get schema() {
    return {
      excludes: "strong em link mark strikethrough",
      parseDOM: [{ tag: "code" }],
      toDOM: () => ["code", { spellCheck: false }],
    };
  }

  inputRules({ type }) {
    return [markInputRule(/(?:^|[^`])(`([^`]+)`)$/, type)];
  }

  keys({ type }) {
    return {
      "Mod`": toggleMark(type),
    };
  }

  get toMarkdown() {
    return {
      open(_state, _mark, parent, index) {
        return backticksFor(parent.child(index), -1);
      },
      close(_state, _mark, parent, index) {
        return backticksFor(parent.child(index - 1), 1);
      },
      escape: false,
    };
  }
}
