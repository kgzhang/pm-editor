import Extension from "../lib/Extension";
import { MarkdownSerializerState } from "prosemirror-markdown";
import { Node as ProsemirrorNode } from "prosemirror-model";

export default abstract class Node extends Extension {
  get type() {
    return "Node";
  }

  abstract get schema();

  get markdownToken(): string {
    return "";
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    console.error("toMarkdown not implemented", state, node);
  }

  parseMarkdown() {
    return null;
  }
}
