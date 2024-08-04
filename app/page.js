'use client';

import { useState, useEffect } from "react";
import { firestore, auth } from "@/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { collection, getDocs, query, getDoc, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import Link from "next/link";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(""); // State for storing the user's name

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Retrieve user's name from Firestore
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
        
        updateInventory(currentUser.uid);
      } else {
        setUser(null);
        setInventory([]); 
        setUserName(""); // Clear userName when user logs out
      }
    });

    return () => unsubscribe();
  }, []);

  const updateInventory = async (userId) => {
    const userInventoryRef = collection(firestore, `users/${userId}/inventory`);
    const snapshot = query(userInventoryRef);
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach(doc => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  const removeItem = async (name) => {
    if (!user) return;

    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory(user.uid);
  };

  const addItem = async (name) => {
    if (!user) return;

    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory(user.uid);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      bgcolor="#f7f7f7" 
      padding={2}
    >
      {user ? (
        <>
          <Typography variant="h5" style={styles.header}>
            Welcome, {userName}
          </Typography>
          <Button variant="outlined" style={styles.signOutButton} onClick={handleSignOut}>
            Sign Out
          </Button>
          <Modal open={open} onClose={handleClose}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="white"
              borderRadius="10px"
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{ transform: "translate(-50%, -50%)" }}
            >
              <Typography variant="h4">Add Item</Typography>
              <Stack width="100%" direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    addItem(itemName);
                    setItemName("");
                    handleClose();
                  }}
                  style={styles.addItemButton}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Button variant="contained" color="primary" onClick={handleOpen} style={styles.addItemButton}>
            Add Item
          </Button>
          <Box 
            width="100%" 
            maxWidth="800px" 
            mt={2} 
            p={2} 
            bgcolor="#ADD8E6" 
            borderRadius={2} 
            display="flex" 
            justifyContent="center" 
            alignItems="center"
          >
            <Typography variant="h4" color="#333">
              Inventory Items
            </Typography>
          </Box>
          <Stack 
            width="100%" 
            maxWidth="800px" 
            spacing={2} 
            mt={2} 
            sx={{ maxHeight: "60vh", overflow: "auto" }}
          >
            {inventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="100px"
                bgcolor="#f9f9f9"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                borderRadius={2}
                boxShadow={2}
              >
                <Typography variant="h6" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h6" color="#333">
                  {quantity}
                </Typography>
                <Button variant="outlined" style={styles.removeItemButton} onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Typography variant="h4" style={styles.header}>
            Please sign in to view your inventory.
          </Typography>
          <Link href="/signin" passHref>
            <Button variant="contained" style={styles.signInButton}>
              Sign In
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="outlined" style={styles.signUpButton}>
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </Box>
  );
}

const styles = {
  header: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  signOutButton: {
    width: '300px',
    padding: '10px',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '5px',
    fontSize: '16px',
    textTransform: 'none',
    marginBottom: '20px',
  },
  addItemButton: {
    width: '100px',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    textTransform: 'none',
  },
  signInButton: {
    width: '300px',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    marginBottom: '10px',
    cursor: 'pointer',
    textTransform: 'none',
  },
  signUpButton: {
    width: '300px',
    padding: '10px',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '5px',
    fontSize: '16px',
    textTransform: 'none',
  },
  removeItemButton: {
    color: '#ff0000',
    border: '2px solid #ff0000',
    borderRadius: '5px',
    textTransform: 'none',
  },
};
