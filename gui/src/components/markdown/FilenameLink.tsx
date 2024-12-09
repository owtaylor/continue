import { RangeInFile } from "core";
import { useContext } from "react";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import FileIcon from "../FileIcon";
import { getFileName } from "core/util/uri";

interface FilenameLinkProps {
  rif: RangeInFile;
}

function FilenameLink({ rif }: FilenameLinkProps) {
  const ideMessenger = useContext(IdeMessengerContext);

  function onClick() {
    ideMessenger.post("showLines", {
      filepath: rif.filepath,
      startLine: rif.range.start.line,
      endLine: rif.range.end.line,
    });
  }

  return (
    <span
      className="mx-[0.1em] mb-[0.15em] inline-flex cursor-pointer items-center gap-0.5 rounded-md pr-[0.2em] align-middle hover:ring-1"
      onClick={onClick}
    >
      <FileIcon filename={rif.filepath} height="20px" width="20px" />
      <span className="mb-0.5 align-baseline underline underline-offset-2">
        {getFileName(rif.filepath)}
      </span>
    </span>
  );
}

export default FilenameLink;
