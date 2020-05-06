import * as React from "react";
import { SearchResult } from "./LinkEditor";
import { EditorView } from "prosemirror-view";

type Props = {
  tooltip: typeof React.Component;
  commands: Record<string, any>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (url: string) => void;
  view: EditorView;
};

const menuRef = React.createRef<HTMLDivElement>();
const SSR = typeof window === "undefined";

function calculatePosition(props: Props) {
  const { view } = props;
  const { selection } = view.state;

  // If there is no selection, the selection is empty or the selection is a
  // NodeSelection instead of a TextSelection then hide the formatting
  // toolbar offscreen

  if (
    !selection ||
    !menuRef.current ||
    selection.empty ||
    selection.node ||
    SSR
  ) {
    return {
      left: -1000,
      top: 0,
      offset: 0,
    };
  }

  // based on the start and end of the selection calculate the position at the center top
  const startPos = view.coordsAtPos(selection.$from, pos);
  const endPos = view.coordsAtPos(selection.$to.pos);

  // tables are an oddity, and need their own logic
  const isColSelection = selection.isColSelection && selection.isColSelection();
  const isRowSelection = selection.isRowSelection && selection.isRowSelection();

  if (isRowSelection) {
    endPos.left = startPos.left + 12;
  } else if (isColSelection) {
    const { node: element } = view.domAtPos(selection.$from.pos);
    const { width } = element.getBoundingClientRect();
    endPos.left = startPos.left + width;
  }

  const halfSelection = Math.abs(endPos.left - startPos.left) / 2;
  const centerOfSelection = startPos.left + halfSelection;
}

export default class FloatingToolbar extends React.Component<Props> {
  state = {
    left: 0,
    top: 0,
    offset: 0,
  };

  componentDidUpdate() {
    const newState = calculatePosition(this.props);

    if (!isEqual(newState, this.state)) {
      this.setState(newState);
    }
  }
}
