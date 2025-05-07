import { useEffect, useState, useCallback } from "react";

import { TexFileService } from "@/services/latex/texFileService";
import {
  Folder,
  File,
  FilePlus,
  FolderPlus,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  FileUp,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { ScrollArea } from "@/components/ui/scroll-area";

import { UploadFilePayload } from "@/services/latex/models";

interface UploadFileComponentProps {
  isOpen: boolean;
  sessionId: string | undefined;
  currentPeerId: string;
  currSelectedFolder: string;
  closeDialog: () => void;
}

const UploadFileComponent: React.FC<UploadFileComponentProps> = ({
  isOpen,
  sessionId,
  currentPeerId,
  currSelectedFolder,
  closeDialog,
}) => {
  const [toBeUploadedFiles, setToBeUploadedFiles] = useState<File[]>([]);
  const [errorMessageBySize, setErrorMessageBySize] = useState<string>("");
  const [errorMessageByType, setErrorMessageByType] = useState<string>("");

  useEffect(() => {
    if (isOpen) return;
    setToBeUploadedFiles([]);
    setErrorMessageBySize("");
    setErrorMessageByType("");
  }, [isOpen]);

  const onUploadingFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setErrorMessageBySize("");
    setErrorMessageByType("");

    const acceptingFileTypes = [
      ".tex",
      ".bib",
      ".aux",
      ".bbl",
      ".blg",
      ".log",
      ".out",
      ".inp",
      ".bst",
      ".sty",
      ".cls",
      ".dbx",
      ".cbx",
      ".bbx",
      ".lbx",
      ".def",
      ".pdf",
      ".png",
      ".jpg",
      ".jpeg",
      ".eps",
      ".csv",
      ".tsv",
      ".txt",
    ];

    const dataTransfer = new DataTransfer();
    const rejectedFilesBySize: string[] = [];
    const rejectedFilesByType: string[] = [];
    const allowToUploadFiles: File[] = Array.from(event.target.files).filter(
      (file) => {
        console.log("debug file type", file);
        const fileExtension = file.name.split(".").pop();
        if (!acceptingFileTypes.includes(`.${fileExtension}`)) {
          rejectedFilesByType.push(file.name);
          return false;
        }
        if (file.size > 52428800) {
          //50MB
          rejectedFilesBySize.push(file.name);
          return false;
        }

        dataTransfer.items.add(file);
        return true;
      }
    );

    event.target.files = dataTransfer.files;
    setToBeUploadedFiles(allowToUploadFiles);
    if (rejectedFilesBySize.length > 0) {
      setErrorMessageBySize(
        `These files are too large (max 50MB): ${rejectedFilesBySize.join(
          ", "
        )}`
      );
    }
    if (rejectedFilesByType.length > 0) {
      setErrorMessageByType(
        `These files type are not accepted: ${rejectedFilesByType.join(", ")}`
      );
    }
  };

  const removeOnUploadFile = (fileName: string) => {
    const dataTransfer = new DataTransfer();
    const uploadFileElement = document.getElementById(
      "uploadFileElement"
    ) as HTMLInputElement;
    if (!uploadFileElement || !uploadFileElement.files) return;
    // console.log("debug file type 2", fileName, )

    const newToBeUploadedFiles = Array.from(uploadFileElement.files).filter(
      (file) => {
        if (file.name === fileName) {
          return false;
        }

        dataTransfer.items.add(file);
        return true;
      }
    );
    uploadFileElement.files = dataTransfer.files;
    setToBeUploadedFiles(newToBeUploadedFiles);
  };

  const uploadFilesHandler = async () => {
    if (!sessionId) return;
    const formData = new FormData();
    formData.append("currentFolder", currSelectedFolder);
    formData.append("currentPeerId", currentPeerId);
    for (const file of toBeUploadedFiles) {
      formData.append("files", file); // "files" must match backend key
    }
    try {
      const res = await TexFileService.uploadFiles({
        projectId: sessionId,
        formData: formData,
      } as UploadFilePayload);
      console.log("debug res", res);
    } catch (err) {
      console.log("debug err", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Share</Button>
      </DialogTrigger> */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Please select files from your computer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="uploadFileElement"
              type="file"
              className="cursor-pointer"
              onChange={onUploadingFile}
              multiple
              // accept=".tex,.bib,.bst,.sty,.cls,.cbx,.bbx,.lbx,.def,.pdf,.png,.jpg,.jpeg,.eps,.csv,.tsv,.txt"
              accept="*"
              onKeyDown={(e) => {
                if (e.key === "Escape") closeDialog();
              }}
            />
          </div>
        </div>
        {errorMessageBySize && (
          <div className="text-red-600">{errorMessageBySize}</div>
        )}
        {errorMessageByType && (
          <div className="text-red-600">{errorMessageByType}</div>
        )}
        <ScrollArea className="h-[360px] rounded-md border p-4">
          {toBeUploadedFiles &&
            toBeUploadedFiles.map((file, idx) => (
              <ul key={idx} className="flex text-sm sm:justify-between">
                <span className="flex">
                  <FileUp className="w-4 h-4 mr-1" />
                  {file.name}
                </span>
                <TooltipWrapper tooltipContent={"Remove file"}>
                  <X
                    className="mt-1 w-4 h-4 cursor-pointer"
                    onClick={() => removeOnUploadFile(file.name)}
                  />
                </TooltipWrapper>
              </ul>
            ))}
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Close
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="px-3"
            disabled={!Boolean(toBeUploadedFiles.length)}
            onClick={uploadFilesHandler}
          >
            <Upload />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileComponent;
