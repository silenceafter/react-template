import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectOperations } from './operationsSlice';

//данные текущего сеанса (код, который выбран; технология, которая выбрана; операция, которая выбрана)
const initialState = {
  tabs: [
    /*{ 
      id: "1", 
      title: "Вкладка 1", 
      content: { formValues: {}, formErrors: {}, expandedPanels: {} },
      validateForm: () => true,
    }*/
  ],
  tabValue: '1',
  validateForm: false,
  loading: false,
  error: null,
  expandedPanelsDefault: { 
    parameters: true,
    equipment: true,
    components: true,
    materials: true,
    tooling: true,
    measuringTools: true
  }
};

//сохранить введенные данные
/*export const setData = createAsyncThunk(
  'technologiesTree/setData',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost/Ivc/Ogt/ExecuteScripts/SetData.v0.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ошибка запроса');
      return { payload };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);*/

const operationsTabsSlice = createSlice({
  name: 'operationsTabs',
  initialState,
  reducers: {
    setTabs: (state, action) => {
      if (state.tabs.length === 0) {
        state.tabs = action.payload;
        state.activeTabId = action.payload.length > 0 ? action.payload[0].id : null;
      }
    },
    addTab: (state, action) => {
      return {
        ...state,
        tabs: [...state.tabs, action.payload],
        tabValue: action.payload.id,
      };
    },
    removeTab: (state, action) => {
      const updatedTabs = state.tabs.filter((tab) => tab.id !== action.payload);
      return {
        ...state,
        tabs: updatedTabs,
        tabValue: updatedTabs.length ? updatedTabs[0].id : null,
      };
    },
    updateTab: (state, action) => {
      const { id, newContent, newValidateForm } = action.payload;
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === id
            ? {
                ...tab,
                content: {
                  ...tab.content,
                  formValues: newContent.formValues,
                  formErrors: newContent.formErrors || tab.content.formErrors,
                  expandedPanels: newContent.expandedPanels || tab.content.expandedPanels,
                },
                validateForm: newValidateForm || tab.validateForm,
              }
            : tab
        ),
        validateForm: true,
      };
    },
    setTabValue: (state, action) => {
      return {
        ...state,
        tabValue: action.payload,
      }
    },
    toggleValidateFormInSlice: (state) => {
      state.validateForm = !state.validateForm;
    },    
  },
  /*extraReducers: (builder) => {
    builder
      .addCase(setData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setData.fulfilled, (state, action) => {
        state.loading = false;        
      })
      .addCase(setData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    },*/
});

/*export const selectDrawingExternalCode = (state) => state?.drawings?.drawing?.externalCode || '';
export const selectTechnology = (state) => state?.drawings?.technology || {};
export const selectOperation = (state) => state?.drawings?.operation || {};

export const { setDrawing, clearDrawing, setTechnology, clearTechnology, setOperation } = drawingsSlice.actions;*/
export const { setTabs, addTab, removeTab, updateTab, setTabValue, toggleValidateFormInSlice } = operationsTabsSlice.actions;
export default operationsTabsSlice.reducer;