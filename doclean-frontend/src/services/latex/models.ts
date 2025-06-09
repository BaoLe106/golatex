interface CompileToPdfPayload {
  sessionId: string;
  data: any;
}

interface CreateFilePayload {
  fileId: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileDir: string;
  content: string;
  createdBy: string;
  lastUpdatedBy: string;
}

interface UploadFilePayload {
  projectId: string;
  formData: FormData;
}

interface FileData {
  fileId: string;
  fileName: string;
  fileType: string;
  fileDir: string;
  content: string;
  contentType: string;
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
};
