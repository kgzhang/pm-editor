import Mark from "./Mark";
import { InputRule } from "prosemirror-inputrules";
import { toggleMark } from "prosemirror-commands";
import { Plugin } from "prosemirror-state";
import getMarkAttrs from "../lib/getMarkAttrs";

const LINK_INPUT_REGEX = /\[(.+|:?)]\((\S+)\)/;

function isPlainURL(link, parent, index, side) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) {
    return false;
  }

  const content = parent.child(index + (side < 0 ? -1 : 0));
  if (
    !content.isText ||
    content.text !== link.attrs.href ||
    content.marks[content.marks.length - 1] !== link
  ) {
    return false;
  }

  if (index === (side < 0 ? 1 : parent.childCount - 1)) {
    return true;
  }

  const next = parent.child(index + (side < 0 ? -2 : 1));

  return !link.isInSet(next.marks);
}

export default class Link extends Mark {
  get name() {
    return "link";
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: (dom: HTMLElement) => ({
            href: dom.getAttribute("href"),
          }),
        },
      ],
      toDOM: node => [
        "a",
        {
          ...node.attrs,
          rel: "noopener noreferrer nofollow",
        },
        0,
      ],
    };
  }

  inputRules({ type }): any[] {
    return [
      new InputRule(LINK_INPUT_REGEX, (state, match, start, end) => {
        const [okay, alt, href] = match;

        const { tr } = state;

        if (okay) {
          tr.replaceWith(start, end, this.editor.schema.text(alt)).addMark(
            start,
            start + alt.length,
            type.create({ href })
          );
        }

        return tr;
      }),
    ];
  }

  commands({ type }) {
    return ({ href } = { href: "" }) => toggleMark(type, { href });
  }

  keys({ type }) {
    return {
      "Mod-k": toggleMark(type, { href: "" }),
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            if (view.props.editable(view.state) && !event.metaKey) {
              return false;
            }

            const { schema } = view.state;
            const attrs = getMarkAttrs(view.state, schema.marks.link);

            if (attrs.href && event.target instanceof HTMLAnchorElement) {
              const isHashTag = attrs.href.startsWith("#");

              if (isHashTag && this.options.onClickHashtag) {
                event.stopPropagation();
                event.preventDefault();
                this.options.onClickHashtag(attrs.href);
                return true;
              }

              if (this.options.onClickLink) {
                event.stopPropagation();
                event.preventDefault();
                this.options.onClickLink(attrs.href);
                return true;
              }
            }
          },
        },
      }),
    ];
  }

  get toMarkdown() {
    return {
      open(_state, mark, parent, index) {
        return isPlainURL(mark, parent, index, 1) ? "<" : "[";
      },
      close(state, mark, parent, index) {
        return isPlainURL(mark, parent, index, -1)
          ? ">"
          : "](" +
              state.esc(mark.attrs.href) +
              (mark.attrs.title ? " " + state.quote(mark.attrs.title) : "") +
              ")";
      },
    };
  }

  parseMarkdown(): {} {
    return {
      mark: "link",
      getAttrs: tok => ({
        href: tok.attrGet("href"),
        title: tok.attrGet("title") || null,
      }),
    };
  }
}
