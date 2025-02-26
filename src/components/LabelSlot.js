import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';

import { useTreeItem2Utils } from '@mui/x-tree-view/hooks';

export const MUI_X_PRODUCTS = [
  {
    id: 'grid',
    label: 'Data Grid',
    children: [
      {
        id: 'grid-community',
        label: '@mui/x-data-grid',
        secondaryLabel: 'Community package',
      },
      {
        id: 'grid-pro',
        label: '@mui/x-data-grid-pro',
        secondaryLabel: 'Pro package',
      },
      {
        id: 'grid-premium',
        label: '@mui/x-data-grid-premium',
        secondaryLabel: 'Premium package',
      },
    ],
  },
  {
    id: 'pickers',
    label: 'Date and Time pickers',
    children: [
      {
        id: 'pickers-community',
        label: '@mui/x-date-pickers',
        secondaryLabel: 'Community package',
      },
      {
        id: 'pickers-pro',
        label: '@mui/x-date-pickers-pro',
        secondaryLabel: 'Pro package',
      },
    ],
  },
  {
    id: 'charts',
    label: 'Charts',
    children: [{ id: 'charts-community', label: '@mui/x-charts' }],
  },
  {
    id: 'tree-view',
    label: 'Tree View',
    children: [{ id: 'tree-view-community', label: '@mui/x-tree-view' }],
  },
];

function CustomLabel({ children, className, secondaryLabel }) {
  return (
    <div className={className}>
      <Typography>{children}</Typography>
      {secondaryLabel && (
        <Typography variant="caption" color="secondary">
          {secondaryLabel}
        </Typography>
      )}
    </div>
  );
}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const { publicAPI } = useTreeItem2Utils({
    itemId: props.itemId,
    children: props.children,
  });

  const item = publicAPI.getItem(props.itemId);

  return (
    <TreeItem2
      {...props}
      ref={ref}
      slots={{
        label: CustomLabel,
      }}
      slotProps={{
        label: { secondaryLabel: item?.secondaryLabel || '' },
      }}
    />
  );
});

export default function LabelSlot() {
  return (
    <Box sx={{ minHeight: 200, minWidth: 350 }}>
      <RichTreeView
        defaultExpandedItems={['pickers']}
        items={MUI_X_PRODUCTS}
        slots={{ item: CustomTreeItem }}
      />
    </Box>
  );
}