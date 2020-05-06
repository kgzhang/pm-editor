import * as React from "react";
import { Mark } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import theme from "../theme";
import { TrashIcon, OpenIcon } from "outline-icons";
import isUrl from "../lib/isUrl";
import { setTextSelection } from "prosemirror-utils";
import styled, { withTheme } from "styled-components";
import Flex from "./Flex";
import ToolbarButton from "./ToolbarButton";
import LinkSearchResult from "./LinkSearchResult";

export type SearchResult = {
  title: string;
  url: string;
};

type Props = {
  mark: Mark;
  from: number;
  to: number;
  tooltip: typeof React.Component;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink?: (url: string) => void;
  view: EditorView;
  theme: typeof theme;
};

class LinkEditor extends React.Component<Props> {
  discardInputValue = false;
  initialValue: string = this.props.mark.attrs.href;

  state = {
    selectedIndex: -1,
    value: this.props.mark.attrs.href,
    results: [],
  };

  componentWillUnmount() {
    if (this.discardInputValue) {
      return;
    }

    // Update the link saved as the mark whenever the link editor closes
    let href = (this.state.value || "").trim();

    if (!href) {
      return this.handleRemoveLink();
    }

    // if the input doesn't start with a protocol or relative slash, make sure
    // a protocol is added
    if (!isUrl(href) && !href.startsWith("/")) {
      href = `https://${href}`;
    }

    this.save(href);
  }

  save = (href: string): void => {
    this.discardInputValue = true;

    const { from, to } = this.props;
    const { state, dispatch } = this.props.view;
    const markType = state.schema.marks.link;

    dispatch(
      state.tr
        .removeMark(from, to, markType)
        .addMark(from, to, markType.create({ href }))
    );
  };

  handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (this.state.selectedIndex >= 0) {
        this.save(this.state.results[this.state.selectedIndex].url);
      }

      this.moveSelectionToEnd();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      if (this.initialValue) {
        this.setState({ value: this.initialValue }, this.moveSelectionToEnd);
      } else {
        this.handleRemoveLink();
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      const prevIndex = this.state.selectedIndex - 1;

      this.setState({
        selectedIndex: Math.max(0, prevIndex),
      });
    }

    if (event.key === "ArrowDown" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();

      const total = this.state.results.length - 1;
      const nextIndex = this.state.selectedIndex + 1;
      this.setState({
        selectedIndex: Math.min(nextIndex, total),
      });
    }
  };

  handleChange = async (event): Promise<void> => {
    const value = event.target.value.trim();
    const looksLikeUrl = isUrl(value);

    this.setState({
      value,
      results: looksLikeUrl ? [] : this.state.results,
      selectedIndex: -1,
    });

    // if it doesn't seem to be a url, try searching for matching documents
    if (value && !looksLikeUrl && this.props.onSearchLink) {
      try {
        const results = await this.props.onSearchLink(value);
        this.setState({ results });
      } catch (error) {
        console.error(error);
      }
    } else {
      this.setState({ results: [] });
    }
  };

  handleOpenLink = (event): void => {
    const { href } = this.props.mark.attrs;

    event.preventDefault();
    this.props.onClickLink(href);
  };

  handleRemoveLink = (): void => {
    this.discardInputValue = true;
    const { from, to, mark } = this.props;
    const { state, dispatch } = this.props.view;

    dispatch(state.tr.removeMark(from, to, mark));
  };

  handleSearchResultClick = (url: string) => event => {
    event.preventDefault();
    this.save(url);
    this.moveSelectionToEnd();
  };

  moveSelectionToEnd() {
    const { to, view } = this.props;
    const { state, dispatch } = view;

    dispatch(setTextSelection(to)(state.tr));
    view.focus();
  }

  render() {
    const { mark } = this.props;
    const Tooltip = this.props.tooltip;
    const showResults = this.state.results.length > 0;

    return (
      <Wrapper>
        <Input
          value={this.state.value}
          placeholder="Search or paste a link…"
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          autoFocus={mark.attrs.href === ""}
        />
        <ToolbarButton
          onClick={this.handleOpenLink}
          disabled={!this.state.value}
        >
          <Tooltip tooltip="Open link" placement="top">
            <OpenIcon color={this.props.theme.toolbarItem} />
          </Tooltip>
        </ToolbarButton>
        <ToolbarButton onClick={this.handleRemoveLink}>
          <Tooltip tooltip="Remove link" placement="top">
            <TrashIcon color={this.props.theme.toolbarItem} />
          </Tooltip>
        </ToolbarButton>
        {showResults && (
          <SearchResults>
            {this.state.results.map((result, index) => (
              <LinkSearchResult
                key={result.url}
                title={result.title}
                onClick={this.handleSearchResultClick(result.url)}
                selected={index === this.state.selectedIndex}
              />
            ))}
          </SearchResults>
        )}
      </Wrapper>
    );
  }
}

const Wrapper = styled(Flex)`
  margin-left: -8px;
  margin-right: -8px;
  min-width: 300px;
`;

const SearchResults = styled.ol`
  background: ${props => props.theme.toolbarBackground};
  position: absolute;
  top: 100%;
  width: 100%;
  height: auto;
  left: 0;
  padding: 8px;
  margin: -3px 0 0;
  border-radius: 0 0 4px 4px;
`;

const Input = styled.input`
  font-size: 15px;
  background: ${props => props.theme.toolbarInput};
  color: ${props => props.theme.toolbarItem};
  border-radius: 2px;
  padding: 4px 8px;
  border: 0;
  margin: 0;
  outline: none;
  flex-grow: 1;
`;

export default withTheme(LinkEditor);
