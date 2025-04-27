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

interface FileData {
  fileId: string;
  fileName: string;
  fileType: string;
  fileDir: string;
  content: string;
}

// interface ContentData {
//   fileName: string;
//   fileType: string;
//   fileDir: string;
//   content: string;
// }

export type { CompileToPdfPayload, CreateFilePayload, FileData };
