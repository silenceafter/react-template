import React, { useEffect, useState, useRef, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { 
    AppBar,
    Autocomplete, 
    Box, 
    CircularProgress, 
    Grid,
    Link,
    ListItem, 
    ListItemText,
    TextField,
    Toolbar
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, setSearch, setPage, selectSearch, selectLimit, selectPage } from '../store/slices/operationsSlice';
import { debounce } from 'lodash';
import Skeleton from '@mui/material/Skeleton';

const OperationsSearch = React.memo(({props, id, selectedValue, options, onOptionSelect, errorValue }) => {
  const dispatch = useDispatch();

  //стейты
  const [inputValue, setInputValue] = useState('');
  
  //запросы
  /*const search = useSelector(selectSearch);
  const limit = useSelector(selectLimit);
  const page = useSelector(selectPage);*/
  const { 
    search = '', 
    limit = 10, 
    page = 1, 
    items = [], 
    loading = false, 
    hasMore = false 
  } = options;

  //запросы для прокрутки списка
  const listRef = useRef(null);

  const debouncedFetchData = debounce(() => {
    dispatch(fetchData({ search: inputValue, limit, page: 1 }));
  }, 1);

  /*useEffect(() => {
    //загрузка данных при пустом поисковом запросе
    if (!search) {
      dispatch(fetchData({ search: '', limit, page: 1 }));
    }
  }, [dispatch, search, limit, page]);

  useEffect(() => {
    //поиск при изменении значения в поле ввода
    if (inputValue !== search) {
      dispatch(setSearch(inputValue));
      debouncedFetchData();
    }
  }, [inputValue, search, debouncedFetchData, dispatch]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);//чистим обработчик при размонтировании
  }, [loading, hasMore]);*/

  const handleScroll = (event) => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && !hasMore) {
        dispatch(setPage(page + 1));
        dispatch(fetchData({ search, limit, page: page + 1 }));
      }
    }
  };

  const refValue = useRef(selectedValue);
  //
  return (    
    <>
    {console.log(items)}
        <Autocomplete
          options={items || []}
          getOptionLabel={(option) => `${option.code} ${option.name}`}
          getOptionSelected={(option, value) => option.code === value.code && option.name === value.name}
          filterOptions={(options, state) => {
              const { inputValue } = state;
              return options.filter(option =>
              option.code.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.name.toLowerCase().includes(inputValue.toLowerCase())
              );
          }}
          onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
          }}
          onChange={(event, newValue) => {
            if (onOptionSelect) {
              onOptionSelect(id, newValue);
            }              
          }}
          inputValue={inputValue}
          loadingText="поиск данных"
          noOptionsText="нет результатов"
          loading={loading}
          ListboxProps={{                  
              onScroll: handleScroll,
              ref: listRef,
              sx: {
              maxHeight: '42.5vh',
              overflowY: 'auto'
              }
          }}
          renderGroup={(params) => (
              <div key={params.key}>
              {params.children}
              {loading && (
                  <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '10px'}}
                  >
                  <CircularProgress size={24} />
                  </Box>
              )}
              </div>
          )}
          renderOption={(props, option) => (
              <ListItem {...props} key={`${option.code}-${option.name}`} style={{ padding: '8px 16px' }}>
              <ListItemText
                  primary={option.code}
                  secondary={option.name}
                  primaryTypographyProps={{ style: { fontWeight: 'bold' } }}
                  secondaryTypographyProps={{ style: { fontSize: 'small', color: 'gray' } }}
              />
              </ListItem>
          )}
          renderInput={(params) => (
              <TextField
                {...params}
                required
                fullWidth
                name='operationCode2'
                id={props.id}
                error={!!errorValue}
                helperText={errorValue}
                placeholder={props.placeholder}
                variant="outlined"
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                size='small'            
              />
          )}
          sx={{
              '& .MuiAutocomplete-listbox': {
              backgroundColor: '#fff',
              boxShadow: 2
              },
              '& .MuiAutocomplete-option': {
              padding: '8px 16px'
              },
          }}
          value={refValue.current}
            />
    </>
  );
});

export { OperationsSearch };