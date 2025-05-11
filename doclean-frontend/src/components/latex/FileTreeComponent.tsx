import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { TexFileService } from "@/services/latex/texFileService";
import {
  CreateFilePayload,
  // CompileToPdfPayload,
  FileData,
} from "@/services/latex/models";
import {
  getCurrentEditorData,
  setCurrFileIdForCurrUserIdInSessionId,
} from "@/stores/editorSlice";

import UploadFileComponent from "@/components/latex/UploadFileComponent";

import {
  Folder,
  File,
  FilePlus,
  FolderPlus,
  Check,
  X,
  Save,
  ChevronRight,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { Tree } from "antd";
import type { GetProps, TreeDataNode } from "antd";
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;
const { DirectoryTree } = Tree;

export interface FileTreeRefHandle {
  updateTreeData: (treeData: TreeDataNode[]) => void;
}

interface FileTreeComponentProps {
  theme: string;
  sessionId: string | undefined;
  currentPeerId: string;
  setContent: (content: FileData) => void;
  setMedia: (data: any) => void;
  setIsThereABibFile: (isThereABibFile: boolean) => void;
}

const FileTreeComponent = forwardRef<FileTreeRefHandle, FileTreeComponentProps>(
  (
    {
      theme,
      sessionId,
      currentPeerId,
      setContent,
      setMedia,
      setIsThereABibFile,
    },
    ref
  ) => {
    const [isAddingFile, setIsAddingFile] = useState<boolean>(false);
    const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
    const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>("");
    const [folderName, setFolderName] = useState<string>("");
    const [currSelectedFolder, setCurrSelectedFolder] = useState<string>("");
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
    const [filesData, setFilesData] = useState<FileData[]>([]);
    const [isFinishedCreatingFileOrFolder, setIsFinishedCreatingFileOrFolder] =
      useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      updateTreeData: (newTreeData: TreeDataNode[]) => {
        console.log("debug updateTreeData", newTreeData);
        setTreeData(newTreeData);
      },
    }));

    useEffect(() => {
      if (!sessionId) return;
      fetchFiles(sessionId);
    }, []);

    useEffect(() => {
      if (!sessionId) return;
      if (!isFinishedCreatingFileOrFolder) return;
      fetchFiles(sessionId);
    }, [isFinishedCreatingFileOrFolder]);

    const getParentFolders = (key: string) => {
      if (key.length === 3) return key;
      const rootFolderKey = key.slice(0, 3);
      const rootFolder = treeData.find(
        (node: any) => node.key === rootFolderKey
      );
      let folderDir: string = "";

      const goThroughChildrenFolders = (
        folderKey: string | undefined,
        folderTitle: string | undefined,
        num: number
      ) => {
        if (!folderKey) return;
        folderDir += "/" + folderTitle;
        if (key.length - 2 === folderKey.length) {
          return;
        }

        const nextItem = rootFolder?.children?.find(
          (child: any) => child.key === key.slice(0, num + 2)
        );

        const nextKey = nextItem?.key.toString();
        const nextTitle = nextItem?.title?.toString();

        goThroughChildrenFolders(nextKey, nextTitle, num + 2);
      };

      goThroughChildrenFolders(rootFolderKey, rootFolder?.title?.toString(), 3);

      return folderDir;
    };

    const fetchFiles = async (sessionId: string) => {
      try {
        const { files, fileTree } = await TexFileService.getFilesByProjectId(
          sessionId
        );
        console.log("debug files", files);
        console.log("debug fileTree", fileTree);

        // const promises: Promise<any>[] = [];
        // files.forEach((file: any) => {
        //   if (file.fileType !== "folder") {
        //     if (file.fileType === "bib") setIsThereABibFile(true);

        //     promises.push(
        //       TexFileService.createFile({
        //         fileId: file.fileId,
        //         projectId: sessionId,
        //         fileName: file.fileName,
        //         fileType: file.fileType,
        //         fileDir: file.fileDir,
        //         content: file.content,
        //         createdBy: file.createdBy,
        //         lastUpdatedBy: file.lastUpdatedBy,
        //       } as CreateFilePayload)
        //     );
        //   }
        // });

        // Promise.all(promises).then((values) => {
        //   console.log(values);
        // });
        setFilesData(files);
        setTreeData(fileTree);
      } catch (err) {
        console.error(err);
      }
    };

    const onSelect = (keys: any, info: any) => {
      console.log("Trigger Select", keys, info);
      // console.log("debug info key", info.node.key);
      if (info.node.key.length !== 3 || !info.node.isLeaf) {
        let res = getParentFolders(info.node.key);

        if (res === info.node.key) {
          res = "/" + info.node.title;
        } else if (!info.node.isLeaf) {
          res += "/" + info.node.title;
        }

        console.log("debug res", res);
        setCurrSelectedFolder(res);
      } else {
        setCurrSelectedFolder("");
      }

      if (info.node.isLeaf) {
        if (!sessionId) return;
        console.log("debug info node", info);
        const currFile = filesData.find(
          (file: any) => file.fileId === info.node.fileId
        );
        console.log("debug currFileData", currFile);
        const nodeTitleSplit = info.node.title.split(".");
        if (currFile?.fileType === "png" || currFile?.fileType === "pdf") {
          console.log("debug set media", currFile?.fileType);
          setMedia({
            fileId: info.node.fileId,
            fileType: currFile?.fileType,
            url: currFile?.content,
          });
        } else {
          setContent({
            fileId: info.node.fileId,
            fileName: nodeTitleSplit[0],
            fileType: nodeTitleSplit[1],
            fileDir: currFile?.fileDir,
            content: info.node.content,
          } as FileData);
        }

        // setCurrFileIdForCurrUserIdInSessionId({
        //   [sessionId]: {
        //     userId: "asdjkadshjk",
        //     fileId: "ajsdkashd",
        //   },
        // });
        // setContent(info.node.content);
      }
    };

    const onExpand = (keys: any, info: any) => {
      // console.log("Trigger Expand", keys, info);
      let expandingFolders = {};
      keys.forEach((key: any) => {
        expandingFolders = { ...expandingFolders, [key]: info.node.title };
      });
    };

    // Handle adding new file
    const createNewFile = async () => {
      setIsAddingFile(true);
    };
    const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileName(e.target.value);
    };

    const handleAddFile = async () => {
      if (!fileName.trim()) return;
      if (!sessionId) return;
      try {
        const fileNameSplit = fileName.split(".");
        const res = await TexFileService.createFile({
          fileId: uuidv4(),
          projectId: sessionId,
          fileName: fileNameSplit[0],
          fileType: fileNameSplit[1],
          fileDir: `/tmp/${sessionId}${currSelectedFolder}`,
          content: "",
          createdBy: currentPeerId,
          lastUpdatedBy: currentPeerId,
        } as CreateFilePayload);
        if (res.status !== 201) {
          throw new Error(res.data.error);
        }
        console.log("debug r u here");
        setIsFinishedCreatingFileOrFolder(true);
        // await fetchFiles(sessionId);
      } catch (err) {
        console.error(err);
      } finally {
        // Reset state
        setFileName("");
        setIsAddingFile(false);
      }
    };

    // Handle adding new folder
    const createNewFolder = async () => {
      setIsAddingFolder(true);
    };

    const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFolderName(e.target.value);
    };

    const handleAddFolder = async () => {
      if (!folderName.trim()) return;
      if (!sessionId) return;

      try {
        const res = await TexFileService.createFile({
          fileId: uuidv4(),
          projectId: sessionId,
          fileName: folderName,
          fileType: "folder",
          fileDir: `/tmp/${sessionId}${currSelectedFolder}/${folderName}`,
          content: "",
          createdBy: currentPeerId,
          lastUpdatedBy: currentPeerId,
        });
        if (res.status !== 201) {
          throw new Error(res.data.error);
        }
        setIsFinishedCreatingFileOrFolder(true);
        // await fetchFiles(sessionId);
      } catch (err) {
        console.error(err);
      } finally {
        // Reset state
        setFolderName("");
        setIsAddingFolder(false);
      }
    };

    // const onClick

    return (
      <>
        <UploadFileComponent
          isOpen={isUploadingFile}
          currSelectedFolder={currSelectedFolder}
          currentPeerId={currentPeerId}
          sessionId={sessionId}
          closeDialog={() => setIsUploadingFile(false)}
        />
        <Dialog
          open={isAddingFile || isAddingFolder}
          onOpenChange={() =>
            isAddingFile ? setIsAddingFile(false) : setIsAddingFolder(false)
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isAddingFile
                  ? "Add File"
                  : isAddingFolder
                  ? "Add New Folder"
                  : null}
              </DialogTitle>
              <DialogDescription>
                In the directory:{" "}
                {currSelectedFolder ? currSelectedFolder : "/"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label className="text-base">
                  {isAddingFile
                    ? "File Name"
                    : isAddingFolder
                    ? "Folder Name"
                    : null}
                </Label>
                <Input
                  autoFocus
                  key={
                    isAddingFile
                      ? "file"
                      : isAddingFolder
                      ? "folder"
                      : "default"
                  }
                  placeholder={
                    isAddingFile
                      ? "Enter file name"
                      : isAddingFolder
                      ? "Enter folder name"
                      : ""
                  }
                  value={
                    isAddingFile ? fileName : isAddingFolder ? folderName : ""
                  }
                  onChange={
                    (e) => {
                      if (isAddingFile) handleFileNameChange(e);
                      else if (isAddingFolder) handleFolderNameChange(e);
                    }
                    // isAddingFile
                    //   ? handleFileNameChange
                    //   : isAddingFolder
                    //   ? handleFolderNameChange
                    //   : undefined
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter"
                      ? isAddingFile
                        ? handleAddFile()
                        : isAddingFolder
                        ? handleAddFolder()
                        : undefined
                      : e.key === "Escape" &&
                        (isAddingFile
                          ? setIsAddingFile(false)
                          : isAddingFolder
                          ? setIsAddingFolder(false)
                          : undefined)
                  }
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  isAddingFile
                    ? !Boolean(fileName.length)
                    : isAddingFolder
                    ? !Boolean(folderName.length)
                    : true
                }
                className="px-3"
                onClick={() => {
                  if (isAddingFile) {
                    handleAddFile();
                  } else if (isAddingFolder) {
                    handleAddFolder();
                  }
                }}
              >
                <Save />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div
          className={
            "flex items-center h-11 px-1 " +
            (theme === "light" ? "bg-[#F0F0F0]" : "bg-black")
          }
        >
          <TooltipWrapper tooltipContent={"New file"}>
            <Button
              className={
                "bg-inherit " +
                (theme === "dark" ? "hover:bg-accent" : "hover:bg-white")
              }
              variant="ghost"
              size="icon"
              onClick={createNewFile}
            >
              <FilePlus className="absolute w-[1.2rem] h-[1.2rem]" />
            </Button>
          </TooltipWrapper>
          <TooltipWrapper tooltipContent={"New folder"}>
            <Button
              className={
                "bg-inherit " +
                (theme === "dark" ? "hover:bg-accent" : "hover:bg-white")
              }
              variant="ghost"
              size="icon"
              onClick={createNewFolder}
            >
              <FolderPlus className="absolute w-[1.2rem] h-[1.2rem]" />
            </Button>
          </TooltipWrapper>
          <TooltipWrapper tooltipContent={"Upload file"}>
            <Button
              className={
                "bg-inherit " +
                (theme === "dark" ? "hover:bg-accent" : "hover:bg-white")
              }
              variant="ghost"
              size="icon"
              onClick={() => setIsUploadingFile(!isUploadingFile)}
            >
              <Upload className="absolute w-[1.2rem] h-[1.2rem]" />
            </Button>
          </TooltipWrapper>
        </div>
        <DirectoryTree
          className="bg-inherit "
          // multiple
          // draggable
          defaultExpandAll
          // rootClassName="text-black dark:text-white"
          // showIcon
          switcherIcon={(node: any) => {
            // console.log(node.expanded);
            return node.expanded ? (
              <ChevronDown className="ml-4 mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
            ) : (
              <ChevronRight className="ml-4 mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
            );
          }}
          icon={(node: any) => {
            // console.log("debug node", node);
            // if (node.isLeaf)
            return node.data.isLeaf ? (
              <File className="mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
            ) : (
              <Folder className="mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
            );
          }}
          titleRender={(node: any) => {
            return (
              <span className="text-black dark:text-white dark:hover:text-white">
                {node.title}
              </span>
            );
          }}
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={treeData}
        />
      </>
    );
  }
);

export default FileTreeComponent;
