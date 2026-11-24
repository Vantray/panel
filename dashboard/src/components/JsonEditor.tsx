import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useTheme } from "@/stores/theme";

// Bundle Monaco locally instead of loading it from a CDN (self-hosted panel).
loader.config({ monaco });

// Workers are resolved by Vite via aliases in vite.config.ts (monaco's
// "exports" map hides the deep esm subpaths from bare-import resolution).
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "json") {
      return new Worker(
        new URL("monaco-editor/esm/vs/language/json/json.worker.js", import.meta.url),
        { type: "module" },
      );
    }
    return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), {
      type: "module",
    });
  },
};

export type JSONEditorProps = {
  onChange: (value: string | undefined) => void;
  /** JSON string or an already-parsed object (pretty-printed for display). */
  json: string | object;
  height?: string;
};

export const JsonEditor = ({ json, onChange, height = "320px" }: JSONEditorProps) => {
  const { colorMode } = useTheme();
  const value = typeof json === "string" ? json : JSON.stringify(json, null, 2);

  return (
    <div className="h-full overflow-hidden rounded-lg border border-border">
      <Editor
        height={height}
        defaultLanguage="json"
        language="json"
        value={value}
        theme={colorMode === "dark" ? "vs-dark" : "vs"}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          stickyScroll: { enabled: false },
          lineNumbers: "on",
          fontSize: 12,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          formatOnPaste: true,
          renderLineHighlight: "line",
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}
      />
    </div>
  );
};
