import {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { TexFileService } from "@/services/latex/texFileService";
import {
  CreateFilePayload,
  // CompileToPdfPayload,
  FileData,
  DownloadFilePayload,
} from "@/services/latex/models";

import UploadFileComponent from "@/components/latex/UploadFileComponent";

import {
  Folder,
  File,
  FilePlus,
  FolderPlus,
  Save,
  ChevronRight,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { Tree } from "antd";
import type { TreeDataNode } from "antd";
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
  ({ theme, sessionId, currentPeerId, setContent, setMedia }, ref) => {
    const avoidTriggerSelectTreeNodeOnDownloadFile = useRef<boolean>(false);

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
    const [downloadUrl, setDownloadUrl] = useState<string>("");

    useImperativeHandle(ref, () => ({
      updateTreeData: (newTreeData: TreeDataNode[]) => {
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
        const { files, fileTree } =
          await TexFileService.getFilesByProjectId(sessionId);
        setFilesData(files);
        setTreeData(fileTree);
      } catch (err) {
        console.error(err);
      }
    };

    const onSelect = (_keys: any, info: any) => {
      if (avoidTriggerSelectTreeNodeOnDownloadFile.current) return;
      if (info.node.key.length !== 3 || !info.node.isLeaf) {
        let res = getParentFolders(info.node.key);

        if (res === info.node.key) {
          res = "/" + info.node.title;
        } else if (!info.node.isLeaf) {
          res += "/" + info.node.title;
        }

        setCurrSelectedFolder(res);
      } else {
        setCurrSelectedFolder("");
      }

      if (info.node.isLeaf) {
        if (!sessionId) return;
        const currFile = filesData.find(
          (file: any) => file.fileId === info.node.fileId
        );
        const nodeTitleSplit = info.node.title.split(".");
        if (
          currFile?.contentType.includes("image") ||
          currFile?.fileType === "pdf"
        ) {
          setMedia({
            fileId: info.node.fileId,
            fileType: currFile?.fileType,
            contentType: currFile?.contentType,
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
        await TexFileService.createFile({
          fileId: uuidv4(),
          projectId: sessionId,
          fileName: fileNameSplit[0],
          fileType: fileNameSplit[1],
          fileDir: `/tmp/${sessionId}${currSelectedFolder}`,
          content: "",
          createdBy: currentPeerId,
          lastUpdatedBy: currentPeerId,
        } as CreateFilePayload);

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
        await TexFileService.createFile({
          fileId: uuidv4(),
          projectId: sessionId,
          fileName: folderName,
          fileType: "folder",
          fileDir: `/tmp/${sessionId}${currSelectedFolder}/${folderName}`,
          content: "",
          createdBy: currentPeerId,
          lastUpdatedBy: currentPeerId,
        });

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

    const downloadFile = async (fileId: string) => {
      avoidTriggerSelectTreeNodeOnDownloadFile.current = true;
      if (!sessionId) return;
      const currFile = filesData.find((file: any) => file.fileId === fileId);
      if (!currFile) return;
      try {
        const fileDirSplit = currFile.fileDir.split(currFile?.fileDir);
        const fileDir = fileDirSplit.length > 1 ? `${fileDirSplit[1]}` : "";
        const res = await TexFileService.downloadFile({
          fileId: currFile.fileId,
          projectId: sessionId,
          fileName: currFile.fileName,
          fileType: currFile.fileType,
          fileDir: fileDir,
          content: currFile.content,
          contentType: currFile.contentType,
        } as DownloadFilePayload);
        setDownloadUrl(res.data.URL);
        setTimeout(() => {
          const downloadLink = document.getElementById("download-component");
          if (downloadLink) {
            downloadLink.click();
          }
        }, 200);
      } catch (err: any) {
      } finally {
        avoidTriggerSelectTreeNodeOnDownloadFile.current = false;
      }
    };

    const deleteFile = async (fileId: string) => {
      if (!sessionId) return;
      // const currFile = filesData.find((file: any) => file.fileId === fileId);
      // if (!currFile) return;

      avoidTriggerSelectTreeNodeOnDownloadFile.current = true;
      try {
        await TexFileService.deleteFile(sessionId, fileId);
        // setIsFinishedCreatingFileOrFolder(true);
      } catch (err) {
        console.error(err);
      } finally {
        avoidTriggerSelectTreeNodeOnDownloadFile.current = false;
      }
    };

    return (
      <>
        {/* For Download File */}
        <a
          id="download-component"
          className="hidden"
          href={downloadUrl}
          download
        ></a>
        {/* For Download File */}
        <UploadFileComponent
          isOpen={isUploadingFile}
          currSelectedFolder={currSelectedFolder}
          currentPeerId={currentPeerId}
          currentFileNumber={filesData.length}
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
            <DialogFooter className="justify-between">
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
          <TooltipWrapper
            tooltipContent={
              filesData.length < 30
                ? "New file"
                : "Cannot add more files (reach limit)"
            }
          >
            <span className="inline-block">
              <Button
                className={
                  "bg-inherit " +
                  (theme === "dark" ? "hover:bg-accent" : "hover:bg-white")
                }
                variant="ghost"
                size="icon"
                disabled={filesData.length >= 30}
                onClick={createNewFile}
              >
                <FilePlus className="absolute w-[1.2rem] h-[1.2rem]" />
              </Button>
            </span>
          </TooltipWrapper>
          <TooltipWrapper
            tooltipContent={
              filesData.length < 30
                ? "New folder"
                : "Cannot add more folders (reach limit)"
            }
          >
            <span className="inline-block">
              <Button
                className={
                  "bg-inherit " +
                  (theme === "dark" ? "hover:bg-accent" : "hover:bg-white")
                }
                variant="ghost"
                size="icon"
                disabled={filesData.length >= 30}
                onClick={createNewFolder}
              >
                <FolderPlus className="absolute w-[1.2rem] h-[1.2rem]" />
              </Button>
            </span>
          </TooltipWrapper>
          <TooltipWrapper
            tooltipContent={
              filesData.length < 30
                ? "Upload file"
                : "Cannot upload more files (reach limit)"
            }
          >
            <span className="inline-block">
              <Button
                className={
                  "bg-inherit " +
                  (theme === "dark" ? "hover:bg-accent" : "hover:bg-white")
                }
                variant="ghost"
                size="icon"
                disabled={filesData.length >= 30}
                onClick={() => setIsUploadingFile(!isUploadingFile)}
              >
                <Upload className="absolute w-[1.2rem] h-[1.2rem]" />
              </Button>
            </span>
          </TooltipWrapper>
        </div>
        <ScrollArea className="h-[89vh]">
          <DirectoryTree
            className="bg-inherit "
            defaultExpandAll
            onRightClick={() => {
              return false;
            }}
            switcherIcon={(node: any) => {
              return node.expanded ? (
                <ChevronDown className="ml-4 mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
              ) : (
                <ChevronRight className="ml-4 mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
              );
            }}
            icon={(node: any) => {
              return node.data.isLeaf ? (
                <File className="mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
              ) : (
                <Folder className="mt-1 !h-4 !w-4 text-black dark:text-white dark:hover:text-white" />
              );
            }}
            titleRender={(node: any) => {
              return (
                <ContextMenu>
                  <ContextMenuTrigger className="flex h-[24px] items-center w-full">
                    <span className="flex w-full text-black dark:text-white dark:hover:text-white">
                      {node.title}
                    </span>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-52">
                    <ContextMenuItem
                      inset
                      onClick={() => downloadFile(node.fileId)}
                    >
                      Download...
                      {/* <ContextMenuShortcut>⌘[</ContextMenuShortcut> */}
                    </ContextMenuItem>
                    {/* <ContextMenuItem inset>
                    Rename
                    <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                  </ContextMenuItem> */}
                    <ContextMenuItem
                      inset
                      className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900"
                      onClick={() => deleteFile(node.fileId)}
                    >
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            }}
            onSelect={onSelect}
            onExpand={onExpand}
            treeData={treeData}
          />
        </ScrollArea>
      </>
    );
  }
);

export default FileTreeComponent;
