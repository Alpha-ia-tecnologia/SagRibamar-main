// src/types/react-quill-new.d.ts
declare module "react-quill-new" {
  import * as React from "react";
  interface QuillProps {
    value?: string;
    onChange?: (content: string, delta?: any, source?: any, editor?: any) => void;
    modules?: any;
    formats?: string[];
    placeholder?: string;
  }
  const ReactQuill: React.ComponentType<QuillProps>;
  export default ReactQuill;
}
