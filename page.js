'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';
import { collection, query, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase';
import styled from '@emotion/styled';
import backgroundImage from '../public/background.jpg';

// Styled components
const Background = styled(Box)({
  backgroundImage: `url(${backgroundImage.src})`,
  backgroundSize: 'cover',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
});

const Container = styled(Box)({
  backgroundColor: '#b0bec5',
  borderRadius: '10px',
  padding: '20px',
  maxWidth: '800px',
  width: '100%',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  opacity: 1, // Fully opaque
});

const LogContainer = styled(Box)({
  backgroundColor: '#e0e0e0',
  borderRadius: '10px',
  padding: '20px',
  maxWidth: '800px',
  width: '100%',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  marginTop: '20px',
  opacity: 0.9, // Slightly transparent
});

const Heading = styled(Typography)({
  fontFamily: 'Arial, sans-serif',
  color: '#1e88e5',
  marginBottom: '20px',
  textAlign: 'center',
  fontSize: '2.5rem', // Bigger text
  fontWeight: 'bold', // Darker text
});

const Description = styled(Typography)({
  marginBottom: '20px',
  color: '#333', // Darker text
  textAlign: 'center',
  fontSize: '1.2rem', // Bigger text
});

const ItemContainer = styled(Box)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '10px',
  marginBottom: '10px',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid #ccc',
});

const AddButton = styled(Button)({
  backgroundColor: '#4caf50',
  '&:hover': {
    backgroundColor: '#388e3c',
  },
});

const DeleteButton = styled(Button)({
  backgroundColor: '#f44336',
  '&:hover': {
    backgroundColor: '#c62828',
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [log, setLog] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const q = query(collection(firestore, 'inventory'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const inventoryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(inventoryList);
    });
    return unsubscribe;
  };

  const addItem = async () => {
    if (itemName && itemCount) {
      const newItem = { name: itemName, count: parseInt(itemCount), category, dateAdded: new Date().toISOString() };
      const tempId = Date.now().toString(); // Temporary ID for optimistic UI update
      setInventory(prev => [...prev, { id: tempId, ...newItem }]);
      setItemName('');
      setItemCount('');
      setCategory('');

      try {
        const docRef = await addDoc(collection(firestore, 'inventory'), newItem);
        setLog(prev => [...prev, { action: 'added', ...newItem, id: docRef.id }]);
        setInventory(prev => prev.map(item => item.id === tempId ? { id: docRef.id, ...newItem } : item));
      } catch (error) {
        console.error('Error adding item:', error);
        setInventory(prev => prev.filter(item => item.id !== tempId));
      }
    }
  };

  const deleteItem = async (id) => {
    const itemToDelete = inventory.find(item => item.id === id);
    if (itemToDelete) {
      setInventory(prev => prev.filter(item => item.id !== id)); // Optimistic UI update
      setDeletedItems(prev => [...prev, itemToDelete]);

      try {
        await deleteDoc(doc(firestore, 'inventory', id));
        setLog(prev => [...prev, { action: 'deleted', ...itemToDelete }]);
      } catch (error) {
        console.error('Error deleting item:', error);
        setInventory(prev => [...prev, itemToDelete]); // Revert UI update on error
        setDeletedItems(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const clearLog = () => {
    setLog([]);
  };

  return (
    <Background>
      <Container>
        <Heading variant="h2">Pantry Management</Heading>
        <Description>
          Welcome to your pantry management app. Here you can:
          <ul>
            <li>Add new items to your pantry</li>
            <li>Update the count of existing items</li>
            <li>Delete items you no longer need</li>
            <li>Search for items in your pantry</li>
          </ul>
        </Description>

        <Box mb={2}>
          <TextField
            label="Item Name"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ mr: 1 }}
            InputLabelProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
            InputProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
          />
          <TextField
            label="Item Count"
            type="number"
            variant="outlined"
            value={itemCount}
            onChange={(e) => setItemCount(e.target.value)}
            sx={{ mr: 1 }}
            InputLabelProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
            InputProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
          />
          <TextField
            label="Category"
            variant="outlined"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ mr: 1 }}
            InputLabelProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
            InputProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
          />
          <AddButton variant="contained" onClick={addItem}>
            Add Item
          </AddButton>
        </Box>

        <Box mb={2}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mr: 1 }}
            InputLabelProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
            InputProps={{ style: { fontSize: '1.2rem', color: '#333' } }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />
        
        {inventory.length > 0 ? (
          inventory
            .filter(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => (
              <ItemContainer key={item.id}>
                <Typography variant="body1" style={{ fontSize: '1.2rem', color: '#333' }}>{item.name}</Typography>
                <Typography variant="body1" style={{ fontSize: '1.2rem', color: '#333' }}>{item.count}</Typography>
                <Typography variant="body1" style={{ fontSize: '1.2rem', color: '#333' }}>{item.category}</Typography>
                <Typography variant="body2" color="textSecondary" style={{ fontSize: '1rem', color: '#666' }}>
                  Added on: {new Date(item.dateAdded).toLocaleString()}
                </Typography>
                <DeleteButton variant="contained" onClick={() => deleteItem(item.id)}>
                  Delete
                </DeleteButton>
              </ItemContainer>
            ))
        ) : (
          <Typography variant="body1" color="textSecondary" style={{ fontSize: '1.2rem', color: '#666' }}>
            No items found.
          </Typography>
        )}
        
      </Container>

      <LogContainer>
        <Heading variant="h3">Activity Log</Heading>
        <Description>
          This section shows the history of items added and deleted from your pantry.
        </Description>
        {log.length > 0 ? (
          <>
            {log.map((entry, index) => (
              <Box key={index} mb={2} p={2} border="1px solid #ccc" borderRadius="8px">
                <Typography variant="body1" style={{ fontSize: '1.2rem', color: '#333' }}>{`Item: ${entry.name}`}</Typography>
                <Typography variant="body2" color="textSecondary" style={{ fontSize: '1rem', color: '#666' }}>
                  {`Action: ${entry.action}`}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ fontSize: '1rem', color: '#666' }}>
                  {`Category: ${entry.category}`}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ fontSize: '1rem', color: '#666' }}>
                  {`Count: ${entry.count}`}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ fontSize: '1rem', color: '#666' }}>
                  {`Date: ${new Date(entry.dateAdded || entry.dateDeleted).toLocaleString()}`}
                </Typography>
              </Box>
            ))}
            <Button variant="contained" color="secondary" onClick={clearLog}>
              Clear Log
            </Button>
          </>
        ) : (
          <Typography variant="body1" color="textSecondary" style={{ fontSize: '1.2rem', color: '#666' }}>
            No activity recorded.
          </Typography>
        )}
      </LogContainer>
    </Background>
  );
}
