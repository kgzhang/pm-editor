import { lift, wrapIn } from "prosemirror-commands";
import isNodeActive from "../queries/isNodeActive";

export default function toggleWrap(type) {
  return (state, dispatch) => {
    const isActive = isNodeActive(type)(state);

    if (isActive) {
      return lift(state, dispatch);
    }

    return wrapIn(type)(state, dispatch);
  };
}
