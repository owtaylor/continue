import { LLMResult } from "../../hooks/useLLMLog";
import Result from "./Result";
import { memo } from "react";

interface ResultGroupProps {
  group: LLMResult[];
}

const ResultGroup = memo(function ResultGroup({ group }: ResultGroupProps) {
  return (
    <>
      {group.map((result, i) => (
        <Result key={i} result={result}></Result>
      ))}
    </>
  );
});

export default ResultGroup;
