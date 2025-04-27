import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/stores/main";

interface EditorData {
  [sessionId: string]: {
    userId: string;
    fileId: string;
  };
}

interface EditorState {
  data: EditorData;
}

const initialState: EditorState = {
  data: {},
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    // logout: () => initialState,
    setCurrFileIdForCurrUserIdInSessionId: (
      state,
      action: PayloadAction<EditorData>
    ) => {
      state.data = action.payload;
      console.log("debug set editor data");
    },
    // increment: (state) => {
    //   state.count += 1;
    // },
    // decrement: (state) => {
    //   state.count -= 1;
    // },
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.count += action.payload;
    // },
  },
});

export const { setCurrFileIdForCurrUserIdInSessionId } = editorSlice.actions;
export default editorSlice.reducer;

export const getCurrentEditorData = (state: RootState) => state.editor.data;
