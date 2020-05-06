import refractor from "refractor/core";
import bash from "refractor/lang/bash";
import css from "refractor/lang/css";
import clike from "refractor/lang/clike";
import csharp from "refractor/lang/csharp";
import java from "refractor/lang/java";
import javascript from "refractor/lang/javascript";
import json from "refractor/lang/json";
import markup from "refractor/lang/markup";
import php from "refractor/lang/php";
import python from "refractor/lang/python";
import powershell from "refractor/lang/powershell";
import ruby from "refractor/lang/ruby";
import typescript from "refractor/lang/typescript";

import copy from "copy-to-clipboard";
import Node from "./Node";
import { setBlockType } from "prosemirror-commands";
import Prism from "../plugins/Prism";
import { textblockTypeInputRule } from "prosemirror-inputrules";

export default class CodeBlock extends Node {
  constructor() {
    super();

    [
      bash,
      css,
      clike,
      csharp,
      java,
      javascript,
      json,
      markup,
      php,
      python,
      powershell,
      ruby,
      typescript,
    ].forEach(refractor.register);
  }

  get languageOptions() {
    return Object.entries({
      none: "None", // additional entry to disable highlighting
      bash: "Bash",
      css: "CSS",
      clike: "C",
      csharp: "C#",
      markup: "HTML",
      java: "Java",
      javascript: "JavaScript",
      json: "JSON",
      php: "PHP",
      powershell: "Powershell",
      python: "Python",
      ruby: "Ruby",
      typescript: "TypeScript",
    });
  }

  get name() {
    return "code_fence";
  }

  get schema() {
    return {
      attrs: {
        language: {
          default: "javascript",
        },
      },
      content: "text",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
      toDOM: node => {
        const button = document.createElement("button");
        button.innerText = "Copy";
        button.type = "button";
        button.addEventListener("click", this.handleCopyToClipboard(node));

        const select = document.createElement("select");
        select.addEventListener("change", this.handleLanguageChange);

        this.languageOptions.forEach(([key, label]) => {
          const option = document.createElement("option");
          const value = key === "none" ? "" : key;
          option.value = value;
          option.innerText = label;
          option.selected = node.attrs.language === value;
          select.appendChild(option);
        });

        return [
          "div",
          { class: "code-block" },
          ["div", { contentEditable: false }, select, button],
          ["pre", ["code", { spellCheck: false }, 0]],
        ];
      },
    };
  }

  commands({ type }) {
    return () => setBlockType(type);
  }

  keys({ type }) {
    return {
      "Shift-Ctrl-\\": setBlockType(type),
    };
  }

  handleCopyToClipboard(node) {
    return () => {
      copy(node.textContent);
    };
  }

  handleLanguageChange = event => {
    const { view } = this.editor;
    const { tr } = view.state;
    const element = event.target;
    const { top, left } = element.getBoundingClientRect();
    const result = view.posAtCoords({ top, left });

    const transaction = tr.setNodeMarkup(result.inside, null, {
      language: element.value,
    });
    view.dispatch(transaction);
  };

  get plugins() {
    return [Prism({ name: this.name })];
  }

  inputRules({ type }) {
    return [textblockTypeInputRule(/^```$/, type)];
  }

  toMarkdown(state, node) {
    state.write("```" + (node.attrs.language || "") + "\n");
    state.text(node.textContent, false);
    state.ensureNewLine();
    state.write("```");
    state.closeBlock(node);
  }

  get markdownToken() {
    return "fence";
  }

  parseMarkdown() {
    return {
      block: "code_block",
      getAttrs: tok => ({ language: tok.info }),
    };
  }
}
