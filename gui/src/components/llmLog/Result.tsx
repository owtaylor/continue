import { renderMessage } from "./Message";
import { LLMResult } from "../../hooks/useLLMLog";
import { memo } from "react";

interface ResultProps {
  result: LLMResult;
}

const Result = memo(function Result({ result }: ResultProps) {
  switch (result.kind) {
    case "chunk":
      return <span>{result.chunk}</span>;
      break;
    case "message":
      switch (result.message.role) {
        case "assistant":
          return renderMessage(result.message, false);
        default:
          // We don't expect anything but AssistantChatMessages in the reply from the LLM,
          // but log them if they do occur.
          return (
            <div className="border-[color:var(--vscode-panel-border) border-2 border-solid p-1">
              {renderMessage(result.message, true)}
            </div>
          );
      }
      break;
  }
});

export default Result;
