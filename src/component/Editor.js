import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";

function Editor({ socketRef, roomId , onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realTimeEditor"),
        {
          mode: "javascript",
          theme: "dracula",
          lineNumbers: true,
          autoCloseBrackets: true,
          autoCloseTags: true,
        }
      );

      editorRef.current = editor;
      editor.setSize(null, "100%");

      editor.on("change", (instance, changes) => {
        // Send the updated code to the server
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);

        if (origin !== "setValue") {
          socketRef.current.emit("code_change", { roomId, code });
        }
      });
    };

    init();
  }, [socketRef, roomId]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code_change", ({ code }) => {
        if (code !== null && editorRef.current) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("code_change");
      }
    };
  }, [socketRef.current]);

  return (
    <div style={{ height: "600%" }}>
      <textarea id="realTimeEditor"></textarea>
    </div>
  );
}

export default Editor;
