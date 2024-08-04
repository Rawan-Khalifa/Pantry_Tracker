'use client';

import Image from "next/image";
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
  const [user, setUser] = useState(null); // Add user state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        updateInventory(currentUser.uid);
      } else {
        setUser(null);
        setInventory([]); // Clear inventory when user logs out
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
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
      {user ? (
        <>
          <Typography variant="h5" color="#333" mb={2}>
            Welcome, {user.email}
          </Typography>
          <Button variant="outlined" color="secondary" onClick={handleSignOut} sx={{ mb: 2 }}>
            Sign Out
          </Button>
          <Modal open={open} onClose={handleClose}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="white"
              border="2px solid black"
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
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Add Item
          </Button>
          <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" justifyContent="center" alignItems="center" mt={2}>
            <Typography variant="h4" color="#333">
              Inventory Items
            </Typography>
          </Box>
          <Stack width="800px" spacing={2} mt={2} sx={{ maxHeight: "60vh", overflow: "auto" }}>
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
                <Button variant="outlined" color="secondary" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Typography variant="h4" color="#333" mb={2}>
            Please sign in to view your inventory.
          </Typography>
          <Link href="/signin" passHref>
            <Button variant="contained" color="primary" sx={{ mb: 2 }}>
              Sign In
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="outlined" color="secondary">
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </Box>
  );
}
