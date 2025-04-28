import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import { v4 as uuidv4 } from 'uuid';
import { Container } from '@mui/material';
import AddEntityModal from './modal';

interface TableColumn<T> {
  dataKey: keyof T;
  label: string;
  numeric?: boolean;
  width?: number;
}

interface TableComponentProps<T> {
  columns: TableColumn<T>[];
  initialData: T[];
  entityName: string; // "User" or "Location"
  createNewItem: (formData: any) => T;
}

const TableComponent = <T,>({ columns, initialData, entityName, createNewItem }: TableComponentProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (formData: any) => {
    const newItem = createNewItem(formData);
    setData((prevData) => [...prevData, newItem]);
  };

  const VirtuosoTableComponents: TableComponents<T> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props: React.ComponentProps<typeof Table>) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
    TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableHead {...props} ref={ref} />
    )),
    TableRow,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
  };

  const fixedHeaderContent = () => (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={String(column.dataKey)}
          variant="head"
          style={{ width: column.width }}
          sx={{ backgroundColor: 'background.paper' }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );

  const rowContent = (_index: number, row: T) => (
    <>
      {columns.map((column) => (
        <TableCell key={String(column.dataKey)} >
          {String(row[column.dataKey])}
        </TableCell>
      ))}
    </>
  );

  return (
    <Container style={{ height: 400, width: '100%' }}>
      <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ marginBottom: '10px' }}>
        Add {entityName}
      </Button>
      <TableVirtuoso
        data={data}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
      <AddEntityModal
      open={isModalOpen} 
      onClose={handleCloseModal}
      onSubmit={handleSubmit} 
      entityType={entityName}
      />
    </Container>

  );
};

export default TableComponent;
