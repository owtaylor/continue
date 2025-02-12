import { useMemo } from "react";
import { LLMInteraction } from "./useLLMLog";

/**
 * Hook returning memoized information about single logged prompt/response
 * query to the LLM.
 */
export default function useLLMSummary(interaction: LLMInteraction) {
  return useMemo(() => {
    if (interaction.start == undefined) {
      return {
        result: "",
        type: "",
      };
    }

    const type = interaction.start.kind.slice(5);

    let result;
    switch (interaction.end?.kind) {
      case "cancel":
        result = "Cancelled";
        break;
      case "error":
        result = "Error";
        break;
      case "success":
        result = "Success";
        break;
      case undefined:
        result = "";
    }

    let totalTime, promptTokens, generatedTokens;
    if (interaction.end != undefined) {
      totalTime = interaction.end.timestamp - interaction.start.timestamp;
      promptTokens = interaction.end.promptTokens;
      generatedTokens = interaction.end.generatedTokens;
    } else {
      const lastGroup = interaction.results[interaction.results.length - 1];
      const lastItem = lastGroup ? lastGroup[lastGroup.length - 1] : undefined;
      totalTime = lastItem
        ? lastItem.timestamp - interaction.start.timestamp
        : 0;
    }

    return {
      result,
      type,
      totalTime,
      promptTokens,
      generatedTokens,
    };
  }, [interaction]);
}
