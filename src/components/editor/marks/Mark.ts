import { toggleMark } from "prosemirror-commands";
import Extension from "../lib/Extension";

abstract class Mark extends Extension {
  get type() {
    return "mark";
  }

  get schema(): Record<string, any> {
    return null;
  }

  get markdownToken(): string {
    return "";
  }

  get toMarkDown(): Record<string, any> {
    return {};
  }

  parseMarkdown() {
    return {};
  }

  commands({ type }) {
    return () => toggleMark(type);
  }
}

export default Mark;
