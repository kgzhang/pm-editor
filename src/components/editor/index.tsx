import React from "react";

import { light as lightTheme, dark as darkTheme } from "./theme";
import Extension from "./lib/Extension";

export const theme = lightTheme;

export type Props = {
  id?: string;
  value?: string;
  defaultValue: string;
  placeholder: string;
  extensions: Extension[];
  autoFocus?: boolean;
  readonly?: boolean;
  dark?: boolean;
  theme?: typeof theme;
  uploadImage?: (file: File) => Promise<string>;
  onSave?: ({ done: boolean }) => void;
  onCancel?: () => void;
  onChange: (value: () => string) => void;
  onImageUploadStart?: () => void;
  onImageUploadStop?: () => void;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
};

export default class Editor extends React.PureComponent {
  render() {
    return <div>Editor </div>;
  }
}
