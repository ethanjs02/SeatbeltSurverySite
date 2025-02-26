'use client';

import React from 'react';
import { Typography, Button, Container, Tab, Tabs, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import TableComponent from '../../components/table';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}
interface TableColumn<T> {
  dataKey: keyof T;
  label: string;
  numeric?: boolean;
  width?: number;
}

const userColumns: TableColumn<User>[] = [
  { dataKey: 'id', label: 'ID', numeric: true },
  { dataKey: 'firstName', label: 'First Name' },
  { dataKey: 'lastName', label: 'Last Name' },
  { dataKey: 'email', label: 'Email' },
];

const locationColumns: TableColumn<Location>[] = [
  { dataKey: 'id', label: 'ID', numeric: true },
  { dataKey: 'name', label: 'Name' },
  { dataKey: 'address', label: 'Address' },
];

const createNewUser = (formData: { firstName: string; lastName: string; email: string }) => ({
  id: Math.random().toString(36).substr(2, 5),
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
});

const createNewLocation = (formData: { name: string; address: string }) => ({
  id: Math.random().toString(36).substr(2, 5),
  name: formData.name,
  address: formData.address,
});


const Dashboard = () => {
  const router = useRouter();
  const [value, setValue] = React.useState(0);


  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg"style={{position: 'relative', width: "100%" }}>  
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Locations" {...a11yProps(0)} />
            <Tab label="Users" {...a11yProps(1)} />
          </Tabs>
        </Box>
      </Box>

      <CustomTabPanel value={value} index={0}>
      <TableComponent
        columns={userColumns}
        initialData={[]} // Replace with real data later
        entityName="User"
        createNewItem={createNewUser}
      />;
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
      <TableComponent
        columns={locationColumns}
        initialData={[]} // Replace with real data later
        entityName="Location"
        createNewItem={createNewLocation}
      />;
      </CustomTabPanel>
    </Container>
  );
};

export default Dashboard;
