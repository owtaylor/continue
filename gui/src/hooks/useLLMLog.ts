import { useEffect, useReducer } from "react";
import {
  LLMInteractionCancel,
  LLMInteractionChunk,
  LLMInteractionError,
  LLMInteractionItem,
  LLMInteractionMessage,
  LLMInteractionStartChat,
  LLMInteractionStartComplete,
  LLMInteractionStartFim,
  LLMInteractionSuccess,
} from "core";

export type LLMResult = LLMInteractionMessage | LLMInteractionChunk;

const MAX_GROUP_LENGTH = 32;

/**
 * Represents a linear list of LLMInteractionItem, transformed into
 * a form that is more convenient for rendering.
 */
export interface LLMInteraction {
  start?:
    | LLMInteractionStartChat
    | LLMInteractionStartComplete
    | LLMInteractionStartFim;

  // We use an array-of-arrays for efficiency when rendering a streamed result
  // with lots and lots of separate tokens; instead of having a linear list
  // of 1024 Result components, we have 32 ResultGroup components each rendering
  // 32 Results.
  //
  // Inline content can split between one group and the next - we'll let the
  // browser engine sort that out.
  results: LLMResult[][];

  end?: LLMInteractionSuccess | LLMInteractionError | LLMInteractionCancel;
}

export type LLMLog = Map<string, LLMInteraction>;

function appendItemToInteractionResult(
  oldInteraction: LLMInteraction,
  item: LLMInteractionMessage | LLMInteractionChunk,
) {
  let oldLastGroup = oldInteraction.results[oldInteraction.results.length - 1];
  let newResults;

  if (oldLastGroup == undefined || oldLastGroup.length == MAX_GROUP_LENGTH) {
    newResults = [...oldInteraction.results, [item]];
  } else {
    newResults = oldInteraction.results.slice(0, -1);
    newResults.push([...oldLastGroup, item]);
  }

  return {
    ...oldInteraction,
    results: newResults,
  };
}

/**
 * Hook to accumulate log data structures based on messages passed
 * from the core. Note that each call site will create an independent
 * data structure, so this should be only used once at a toplevel
 * component.
 * @returns currently log datastructure.
 */
export default function useLLMLog() {
  const [llmLog, dispatchLlmLog] = useReducer(
    (llmLog: LLMLog, item: LLMInteractionItem) => {
      const oldInteraction = llmLog.get(item.interactionId) || {
        results: [],
      };
      let newInteraction;

      switch (item.kind) {
        case "startChat":
        case "startComplete":
        case "startFim":
          newInteraction = {
            ...oldInteraction,
            start: item,
          };
          break;
        case "chunk":
        case "message":
          newInteraction = appendItemToInteractionResult(oldInteraction, item);
          break;
        case "success":
        case "error":
        case "cancel":
          newInteraction = {
            ...oldInteraction,
            end: item,
          };
          break;
      }

      const newLog = new Map([...llmLog]);
      newLog.set(item.interactionId, newInteraction);
      return newLog;
    },
    new Map(),
  );

  useEffect(function () {
    const onMessage = (event: MessageEvent) => {
      dispatchLlmLog(event.data);
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return llmLog;
}
