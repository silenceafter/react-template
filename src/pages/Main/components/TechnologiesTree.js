import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button, 
  Chip,
  Checkbox,
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  Menu, 
  MenuItem, 
  SpeedDial, 
  SpeedDialIcon, 
  SpeedDialAction, 
  Stack, 
  TextField, 
  Typography 
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { styled, alpha } from '@mui/material/styles';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { 
  TreeItem2, 
  TreeItem2IconContainer
} from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2Utils, useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { 
  selectDrawingExternalCode,
  selectTechnology 
} from '../../../store/slices/drawingsSlice';
import {  
  addItems,
  setSelectedItems, 
  setSelectedId,
  deleteSelectedItems,
  restoreItems, 
  setCheckedItems
} from '../../../store/slices/technologiesSlice';
import { fetchData } from '../../../store/slices/lists/technologiesListSlice';
import { resetTabs } from '../../../store/slices/operationsSlice';
import { TechnologySearch } from '../components/TechnologySearch';
import AdjustIcon from '@mui/icons-material/Adjust';
import CheckIcon from '@mui/icons-material/Check';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';

//действия для SpeedDial
const actions = [
  { icon: <AddIcon />, name: 'add-technology', title: 'Добавить технологию' },
  { icon: <DeleteIcon />, name: 'delete', title: 'Удалить' },
  { icon: <RestoreIcon />, name: 'restoreAll', title: 'Отменить удаление всех элементов' }
];

//добавить кастомный класс и кастомное свойство элементу Box
const useStyles = makeStyles({
  technologyCustomClass: {
    'component-type': (props) => props.itemType
  }
});

function getItemDescendantsIds(item) {
  const ids = [];
  item.children?.forEach((child) => {
    ids.push(child.id);
    ids.push(...getItemDescendantsIds(child));
  });
  return ids;
}

const TechnologiesTree = () => {
  //стейты
  const [expandedItems, setExpandedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [newTechnology, setNewTechnology] = useState(null);

  //селекторы
  const dispatch = useDispatch();
  const items = useSelector((state) => state.technologies.items);
  const loading = useSelector((state) => state.technologies.loading);
  const error = useSelector((state) => state.technologies.error);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);//значение строки поиска (чертежей)
  const technologySelector = useSelector(selectTechnology);
  const { /*selectedItems,*/ disabledItems, checkedItems, selectedId } = useSelector((state) => state.technologies);

  //refs
  const itemRef = useRef(null);
  const toggledItemRef = React.useRef({});
  const apiRef = useTreeViewApiRef();

  const StyledTreeItem2 = styled(TreeItem2)(({ theme, hasSecondaryLabel }) => ({
    color: theme.palette.grey[200],
    [`& .${treeItemClasses.content}`]: {
      borderRadius: theme.spacing(0.5),
      padding: theme.spacing(0.5, 1),
      margin: theme.spacing(0.2, 0),  
      [`& .${treeItemClasses.label}`]: {
        fontSize: '0.8rem',
        fontWeight: 500,
      },
    },
    [`& .${treeItemClasses.iconContainer}`]: {
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.dark,
      padding: theme.spacing(0, 1.2),
      ...theme.applyStyles('light', {
        backgroundColor: alpha(theme.palette.primary.main, 0.25),
      }),
      ...theme.applyStyles('dark', {
        color: theme.palette.primary.contrastText,
      }),
    },
    [`& .${treeItemClasses.groupTransition}`]: {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
    [`&[data-component-type="technology"] .${treeItemClasses.content}`]: {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    },
    [`& .CustomTreeItemSelected`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
    ...theme.applyStyles('light', {
      color: theme.palette.grey[800],
    }),
    ...(hasSecondaryLabel && {
      paddingLeft: theme.spacing(1),
      marginTop: theme.spacing(0.5),
      [`& .${treeItemClasses.label}`]: {
        color: theme.palette.text.secondary,
      },
    })
  }));

  function CustomLabel({ className, secondaryLabel, customLabel, type, labelRef, pp }) {
    const dispatch = useDispatch();
    //стейты
    const [value, setValue] = useState(customLabel);
    //селекторы
    const checkedItems = useSelector((state) => state.technologies.checkedItems);
    const selectedId = useSelector((state) => state.technologies.selectedId);
    //
    return (
      <>
        <div 
          className={selectedId.includes(pp) && type == 'technology' ? `${className} CustomTreeItemSelected` : className}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%'
          }} 
          ref={labelRef}
        >
          <Checkbox
            checked={checkedItems.includes(pp)}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setCheckedItems(pp));
              dispatch(setSelectedId(pp));
            }}
          />
          <div style={{ width: '800%', display: 'flex', flexDirection: 'column' }}>
            <Typography>
              {value}
            </Typography>                    
            {secondaryLabel && (
              <div>             
                <Typography
                  variant="caption" 
                  color="secondary" 
                >
                  {secondaryLabel}
                </Typography>
              </div>
            )}          
          </div>
          {<div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 'auto' }}>
            {/*bb && (
              <TreeItem2IconContainer>
                {/*<EditOutlinedIcon color="success" />*//*}
                <AdjustIcon color="primary" />
              </TreeItem2IconContainer>
            )*/}        
              {/*type == 'technology' && focused && (
                <TreeItem2IconContainer>
                  <AdjustIcon color="primary" />
              </TreeItem2IconContainer>
              )*/}
          </div>}
        </div>
      </>
    );
  }
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem({ onClick, ...props }, ref) {
    const dispatch = useDispatch();
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    const {
      status: { focused , editable, editing }, 
    } = useTreeItem2(props);
    const item = publicAPI.getItem(props.itemId);

    //стейты
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [selected, setSelected] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    //рефы
    const labelRef = useRef(null);

    //эффекты
    useEffect(() => {
      setExpanded(expandedItems.includes(props.itemId));
      setDisabled(disabledItems.includes(props.itemId));
      /*setSelected(selectedItems.includes(props.itemId));*/
    }, [expandedItems, disabledItems, /*selectedItems,*/, props.itemId]);

    //expanded
    const handleRootClick = (e) => {
      //handleCustomTreeItemClick(e, props.itemId);//записать выбранную технологию  
      //dispatch(setTechnology(/*{ name: item.label, code: item.secondaryLabel }*/ item));
      dispatch(setSelectedId(item.id));
      /*const isIconClick = e.target.closest(`.${treeItemClasses.iconContainer}`);//развернуть только при клике на иконку
      if (isIconClick) {
        e.stopPropagation();
        setExpanded((prev) => !prev);           
        handleItemExpansionToggle(null, props.itemId, !expanded);
        return;
      }*/
    };
  
    const handleChildClick = (e) => {
      if (dataLoaded) return;
      e.stopPropagation();
      handleCustomTreeItemClick(e, props.itemId);
    };

    const handleClick = (e) => {
      //e.stopPropagation();
      //handleCustomTreeItemClick(e, props.itemId);//записать выбранную технологию  
      //dispatch(setTechnology(/*{ name: item.label, code: item.secondaryLabel }*/ item));
      
      /*const isIconClick = e.target.closest(`.${treeItemClasses.iconContainer}`);//развернуть только при клике на иконку
      if (isIconClick) {
        e.stopPropagation();
        setExpanded((prev) => !prev);           
        handleItemExpansionToggle(null, props.itemId, !expanded);                
        return;
      }*/
      dispatch(setSelectedId(item.id));
      if (onClick) {
        onClick(e);
      }      
    };

    const classes = useStyles({ itemType: item.type});
    //дополнительный код
    /*const additionalItem = (
      <Box 
        className={classes.technologyCustomClass} 
        key={props.itemId} 
        sx={{ display: 'flex', alignItems: 'center', width: '100%'}}
      >
        <span>{props.label}</span>
      </Box>
    );*/    
    //
    return (
      <>
      <StyledTreeItem2
        {...props}
        slots={{
          label: CustomLabel
        }}
        slotProps={{
          label: { 
            secondaryLabel: item?.secondaryLabel || '',
            /*onLabelClick: (e) => console.log('onLabelClick'),
            onSecondaryLabelClick: (e) => console.log('onSecondaryLabelClick')*/
            customLabel: item?.label || '',
            type: item?.type,
            labelRef: labelRef,
            pp: props.itemId,
          },
        }}
        id={`StyledTreeItem2-${props.itemId}`}
        /*label={additionalItem}*/
        expanded={expanded}
        ref={ref}
        data-component-type={item.type}
        onClick={handleClick}        
      >
        { isProcessing && !dataLoaded ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'auto',
              marginTop: '0.5rem',
              marginBottom: '0.5rem'
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (                
          props.children                             
        )}
      </StyledTreeItem2>      
      </>
    );
  });

  //мемоизированная функция для slots.item (избегаем перерисовки)
  const renderCustomTreeItem = useCallback(
    (props) => {
      return (
        <CustomTreeItem
          {...props}
          key={props.itemId}
          ref={itemRef}
          onContextMenu={(event) => handleContextMenu(event, props.itemId)}
          /*onClick={() => console.log('itemclick')}*/
        />
      );
    },
    [itemRef]
  );  

  const handleItemExpansionToggle = useCallback((event, nodeId, expanded) => {
    setExpandedItems((prevExpanded) => {
      if (expanded) {
        return [...prevExpanded, nodeId];
      } else {
        return prevExpanded.filter((id) => id !== nodeId)
      }
    });
  }, [setExpandedItems]);

  const handleItemSelectionToggle = useCallback((event, itemId, isSelected) => {
    toggledItemRef.current[itemId] = isSelected;
  }, []);

  /*const handleSelectedItemsChange = useCallback((event, newSelectedItems) => {
    dispatch(setSelectedItems(newSelectedItems));
    const itemsToSelect = [];
    const itemsToUnSelect = {};
    Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
      const item = apiRef.current.getItem(itemId);
      //
      if (isSelected) {
        itemsToSelect.push(...getItemDescendantsIds(item));
      } else {
        getItemDescendantsIds(item).forEach((descendantId) => {
          itemsToUnSelect[descendantId] = true;
        });
      }
    });
    //
    const newSelectedItemsWithChildren = Array.from(
      new Set(
        [...newSelectedItems, ...itemsToSelect].filter(
          (itemId) => !itemsToUnSelect[itemId],
        ),
      ),
    );
    dispatch(setSelectedItems(newSelectedItemsWithChildren));
    toggledItemRef.current = {};
  }, [apiRef, dispatch, getItemDescendantsIds]);*/

  //selected, CustomTreeItem
  const handleCustomTreeItemClick = (event, itemId) => {
    //dispatch(setSelectedId(itemId));
  };

  //эффекты
  //анимация загрузки вкладки
  useEffect(() => {
    if (drawingExternalCode != '') {
      setLoadingTimer(true);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 500); 
    }
  }, [drawingExternalCode]);

  useEffect(() => {
    //для expandedItems
    const allItemIds = items.map(item => item.id);
    setExpandedItems(allItemIds);
  }, [items]);

  //на данный момент считаем, что все технологии наши
  useEffect(() => {
    const allItemIds = items.map(item => item.id);
    setExpandedItems(allItemIds);
  }, [items]);

  //chip для выбранной технологии
  const handleDelete = () => {
    //setTechnologyChip(null);
  };

  /*useEffect(() => {
    setTechnologyChip(`${technologySelector.name}: ${technologySelector.code}`);
  }, [technologySelector]);*/

  useEffect(() => {
    dispatch(fetchData({search: '', limit: 50, page: 1}));
  }, [dispatch]);

  useEffect(() => {
    if (items.length > 0) {
      dispatch(setSelectedId([items[0].id]));
    }
  }, [items, dispatch]);

  /*const technologyChip = useMemo(() => {
    return '111';//return `${technologySelector.name}: ${technologySelector.code}`;
  }, [technologySelector]);*/

  const handleSpeedDialActionClick = useCallback((action) => {
    switch(action.name) {
      case 'delete':
        //dispatch(deleteSelectedItems(selectedItems));
        break;

      case 'restoreAll':
        const parentItemIds = items
          .filter(item => item.children && item.children.length > 0)
          .map(item => item.id);
        handleContextMenuItemRestore(disabledItems);
        break;

      case 'add-technology':
        handleDialogOpen();
        //dispatch(addItems());
        break;
    }
  }, [/*selectedItems,*/ disabledItems]);

  //контекстное меню
  const handleContextMenu = (event, nodeId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNode(nodeId);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleContextMenuItemRestore = (nodes) => {
    dispatch(restoreItems(nodes));
    handleContextMenuClose();
  };

  const handleContextMenuItemDelete = (node) => {
    /*dispatch(deleteSelectedItems(node));
    handleContextMenuClose();*/
  };

  const handleContextMenuItemRename = (node) => {
    handleContextMenuClose();
  }



  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };
  
  //вывод
  if (loadingTimer) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const MemoizedRichTreeView = React.memo((props) => (
    <RichTreeView {...props} />
  ));
  //
  return (
    <>
    {console.log(selectedId)}
      <MemoizedRichTreeView
        multiSelect
        apiRef={apiRef}
        slots={{ item: renderCustomTreeItem }}
        items={items}
        disabledItems={disabledItems}
        expandedItems={expandedItems}
        /*selectedItems={selectedItems}*/
        onItemExpansionToggle={handleItemExpansionToggle}
        /*onSelectedItemsChange={handleSelectedItemsChange}*/
        /*onItemSelectionToggle={handleItemSelectionToggle}*/
        isItemDisabled={(item) => disabledItems.includes(item.id)}
        disabledItemsFocusable={true}                        
        expansionTrigger='iconContainer'
      />                        
      <Stack direction="row" spacing={1} sx={{ padding: 2, paddingBottom: 1.8, display: 'flex', flexDirection: 'row', justifyContent: 'right', alignItems: 'center' }}>
        {drawingExternalCode && (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'left', width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', width: '100%' }}>
                <SpeedDial
                  ariaLabel="SpeedDial basic example"
                  sx={{ position: 'absolute', bottom: 0, right: 30, transform: 'scale(0.85)', '& .MuiFab-primary': { width: 45, height: 45 } }}
                  icon={<SpeedDialIcon />}
                >
                  {actions.map((action) => (
                    <SpeedDialAction
                      key={action.name}
                      icon={action.icon}
                      tooltipTitle={action.title}
                      onClick={() => handleSpeedDialActionClick(action)}
                    />
                  ))}
                </SpeedDial>
              </Box>
            </Box>
          </>
        )}
      </Stack>
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleContextMenuItemRestore(selectedNode)}>Отменить удаление</MenuItem>
        <MenuItem onClick={() => handleContextMenuItemDelete(selectedNode)}>Удалить</MenuItem>
        <MenuItem onClick={() => handleContextMenuItemRename(selectedNode)}>Переименовать</MenuItem>
      </Menu>
      {<Dialog
        open={open}
        onClose={handleDialogClose}        
        /*slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event) => {
              
            },
          },
        }}*/        
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const newTechnologyCode = formJson.newTechnologyCode;
            const newTechnologyName = formJson.newTechnologyName;
            //
            dispatch(addItems({ code: newTechnologyCode, name: newTechnologyName }));
            dispatch(resetTabs());
            handleDialogClose();
          }}
        >
        <DialogTitle>Новая технология</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Выберите технологию из списка
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2, width: '500px' }}>
            {<TechnologySearch
              props={{id: "technology-code", name: "newTechnology", placeholder: "Технология"}}
              selectedValue={newTechnology}
              onChange={setNewTechnology}
              /*onChange={(e) => handleOptionSelect('operationCode', e.target.value)}
              selectedValue={localData.formValues.operationCode}
              errorValue={localData.formErrors.operationCode}*/
            />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button type="submit">Подтвердить</Button>
        </DialogActions>
        </form>
      </Dialog>}
    </>
  );
};

export default React.memo(TechnologiesTree);