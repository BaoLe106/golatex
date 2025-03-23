import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { TexFileService } from "@/services/latex/texFileService";
import {
  getCurrentEditorData,
  setCurrFileIdForCurrUserIdInSessionId,
} from "@/stores/editorSlice";

import { FilePlus, FolderPlus, Check, X } from "lucide-react";
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
  setContent: (content: string) => void;
}

const FileTreeComponent = forwardRef<FileTreeRefHandle, FileTreeComponentProps>(
  ({ theme, sessionId, setContent }, ref) => {
    const [isAddingFile, setIsAddingFile] = useState<boolean>(false);
    const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>("");
    const [folderName, setFolderName] = useState<string>("");
    const [currSelectedFolder, setCurrSelectedFolder] = useState<string>("");
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

    useImperativeHandle(ref, () => ({
      updateTreeData: (newTreeData: TreeDataNode[]) => {
        console.log("debug updateTreeData", newTreeData);
        setTreeData(newTreeData);
      },
    }));

    useEffect(() => {
      if (!sessionId) return;
      console.log("debug u r in the file tree component");
      fetchFiles(sessionId);
    }, []);

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

        // const filesInputForGetTreeData = files.map((file: any) => {
        //   const fileDir =
        //     file.fileDir.substring(41) + (file.fileType === "folder" ? "" : "/");
        //   // console.log(fileDir);
        //   if (file.fileType === "folder") {
        //     return { fileDir: fileDir };
        //   }

        //   return { fileDir: fileDir + file.fileName + "." + file.fileType };
        // });
        console.log(files);
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
        setCurrFileIdForCurrUserIdInSessionId({
          [sessionId]: {
            userId: "asdjkadshjk",
            fileId: "ajsdkashd",
          },
        });
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
        const newUserId = uuidv4();
        const res = await TexFileService.createFile({
          fileId: uuidv4(),
          projectId: sessionId,
          fileName: fileNameSplit[0],
          fileType: fileNameSplit[1],
          fileDir: `/tmp/${sessionId}${currSelectedFolder}`,
          content: "",
          createdBy: newUserId,
          lastUpdatedBy: newUserId,
        });
        if (res.status !== 201) {
          throw new Error(res.data.error);
        }
        console.log("debug r u here");
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
        // const folderNameSplit = folderName.split(".");
        const newUserId = uuidv4();
        const res = await TexFileService.createFile({
          fileId: uuidv4(),
          projectId: sessionId,
          fileName: folderName,
          fileType: "folder",
          fileDir: `/tmp/${sessionId}${currSelectedFolder}/${folderName}`,
          content: "",
          createdBy: newUserId,
          lastUpdatedBy: newUserId,
        });
        if (res.status !== 201) {
          throw new Error(res.data.error);
        }

        // await fetchFiles(sessionId);
      } catch (err) {
        console.error(err);
      } finally {
        // Reset state
        setFolderName("");
        setIsAddingFolder(false);
      }
    };

    return (
      <>
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
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
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
        </div>
        <DirectoryTree
          // multiple
          // draggable
          defaultExpandAll
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={treeData}
          // treeData={[
          //   ...treeData,
          //   ...(isAddingFile
          //     ? [
          //         {
          //           key: "0-1-3",
          //           title: (
          //             <div className="inline w-28 h-6">
          //               <Input
          //                 autoFocus
          //                 className="!inline !w-24 !h-6"
          //                 value={fileName}
          //                 onChange={handleFileNameChange}
          //                 onKeyDown={(e) =>
          //                   e.key === "Enter"
          //                     ? handleAddFile()
          //                     : e.key === "Escape" && setIsAddingFile(false)
          //                 }
          //                 // onBlur={() => setIsAddingFile(false)}
          //                 placeholder="Enter file name"
          //               />
          //               <div className="flex ml-6 mt-2">
          //                 <Check
          //                   className="h-4 mr-1 cursor-pointer hover:stroke-[3px] hover:text-[#1677ff]"
          //                   onClick={handleAddFile}
          //                 />
          //                 <X
          //                   className="h-4 cursor-pointer hover:stroke-[3px] hover:text-red-600"
          //                   onClick={() => setIsAddingFile(false)}
          //                 />
          //               </div>
          //             </div>
          //           ),
          //           selectable: false,
          //           // key: "new-file-input",
          //           isLeaf: true, // Ensure it is a file
          //         },
          //       ]
          //     : isAddingFolder
          //     ? [
          //         {
          //           title: (
          //             <Input
          //               autoFocus
          //               className="!inline !w-32 !h-6"
          //               value={folderName}
          //               onChange={handleFolderNameChange}
          //               onKeyDown={(e) => e.key === "Enter" && handleAddFolder()}
          //               // onBlur={() => setIsAddingFolder(false)}
          //               placeholder="Enter folder name"
          //             />
          //           ),
          //           selectable: false,
          //           key: "new-folder-input",
          //           isLeaf: false, // Ensure it is a folder
          //         },
          //       ]
          //     : []),
          // ]}
        />
      </>
    );
  }
);

export default FileTreeComponent;
