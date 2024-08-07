'use client';

import { useState, useEffect } from "react";
import { firestore, auth } from "@/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { collection, getDocs, query, getDoc, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState(""); 
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
        
        updateInventory(currentUser.uid);
      } else {
        setUser(null);
        setInventory([]); 
        setUserName(""); 
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

  const addItem = async (name, type) => {
    if (!user) return;

    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1, type: type });
    }
    await updateInventory(user.uid);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleModalOpen = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const increaseQuantity = async (name) => {
    if (!user) return;

    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
    }
    await updateInventory(user.uid);
  };

  const decreaseQuantity = async (name) => {
    if (!user) return;

    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await updateDoc(docRef, { quantity: quantity - 1 });
      } else {
        await deleteDoc(docRef);
      }
    }
    await updateInventory(user.uid);
  };

  const categorizeInventory = (inventory) => {
    const categories = {
      Vegetables: [],
      Fruits: [],
      Dairy: [],
      Other: [],
    };

    inventory.forEach((item) => {
      const { name, quantity, type } = item;
      if (categories[type]) {
        categories[type].push({ name, quantity });
      } else {
        categories.Other.push({ name, quantity });
      }
    });

    return categories;
  };

  const categorizedInventory = categorizeInventory(inventory);

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="flex-start" 
      alignItems="center" 
      bgcolor="#f7f7f7" 
      overflow="auto"
      paddingBottom="100px" 
      padding={2}
    >
      {user ? (
        <>
          <Typography variant="h5" style={styles.header}>
            Welcome, {userName}
          </Typography>
          <Box width="100%" maxWidth="800px" mt={2} display="flex" flexWrap="wrap" justifyContent="space-around" gap={4}>
            {Object.keys(categorizedInventory).map((category) => (
              <Box 
                key={category} 
                width="200px" 
                height="200px" 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                sx={{
                  backgroundImage: 'url(../images/basket.png)', // Replace with your path
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '10px',
                  boxShadow: 2,
                  cursor: 'pointer',
                }}
                onClick={() => handleModalOpen(category)}
              >
                <Typography variant="h6" style={styles.categoryHeader}>
                  {category}
                </Typography>
                <Typography variant="h6" style={styles.itemCount}>
                  {categorizedInventory[category].length} items
                </Typography>
              </Box>
            ))}
          </Box>
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

      {/* Fixed buttons */}
      {user && (
        <Box style={styles.fixedButtonsContainer}>
          <Button variant="contained" color="primary" onClick={handleOpen} style={styles.addItemButton}>
            Add Item
          </Button>
          <Button variant="outlined" style={styles.signOutButton} onClick={handleSignOut}>
            Sign Out
          </Button>
        </Box>
      )}

      {/* Modal for adding items */}
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
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter Item Name"
            />
            <TextField
              variant="outlined"
              fullWidth
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              placeholder="Enter Item Type (Vegetables, Fruits, Dairy, etc.)"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName, itemType);
                setItemName("");
                setItemType("");
                handleClose();
              }}
              style={styles.addItemButton}
            >
              Add
            </Button>
          </Stack>
        </Box>
        </Modal>
      

      {/* Modal for displaying items in a category */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          maxHeight={500}
          overflowY="auto"
          bgcolor="white"
          borderRadius="10px"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ transform: "translate(-50%, -50%)" }}
        >
          <Typography variant="h4">{selectedCategory} Items</Typography>
          <Stack width="100%" direction="column" spacing={2} style={styles.scrollableContent}>
            {categorizedInventory[selectedCategory]?.map(({ name, quantity }) => (
              <Box
                key={name}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="#f9f9f9"
                borderRadius={2}
                padding={1}
                boxShadow={1}
              >
                <Typography variant="body2" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => increaseQuantity(name)} 
                    style={styles.adjustQuantityButton}
                  >
                    +
                  </Button>
                  <Typography variant="body2" color="#333">
                    {quantity}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => decreaseQuantity(name)} 
                    style={styles.adjustQuantityButton}
                  >
                    -
                  </Button>
                </Box>
                <Button variant="outlined" style={styles.removeItemButton} onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Modal>
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
  categoryHeader: {
    color: '#333',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  itemCount: {
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#007bff',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  scrollableContent: {
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '10px',
  },
  adjustQuantityButton: {
    minWidth: '30px',
    minHeight: '30px',
    padding: '5px',
    borderRadius: '5px',
    textTransform: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    width: '300px',
    padding: '10px',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '5px',
    fontSize: '16px',
    textTransform: 'none',
  },
  addItemButton: {
    width: '300px',
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
  fixedButtonsContainer: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#f7f7f7',
    padding: '10px 0',
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
  },
};        