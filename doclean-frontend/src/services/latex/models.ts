interface FileBase {
  fileId: string;
  fileName: string;
  fileType: string;
  fileDir: string;
  content: string;
}

interface CompileToPdfPayload {
  sessionId: string;
  data: any;
}

interface CreateFilePayload extends FileBase{
  projectId: string;
  createdBy: string;
  lastUpdatedBy: string;
}

interface UploadFilePayload {
  projectId: string;
  formData: FormData;
}

interface FileData extends FileBase {
  contentType: string;
}

interface DownloadFilePayload extends FileData {
  projectId: string;
}

// interface ContentData {
//   fileName: string;
//   fileType: string;
//   fileDir: string;
//   content: string;
// }

export type {
  CompileToPdfPayload,
  CreateFilePayload,
  UploadFilePayload,
  FileData,
  DownloadFilePayload
};
