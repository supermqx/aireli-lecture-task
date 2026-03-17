import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { PlatformUser } from "@enterprise-commerce/core/platform/types"
import openDb from '../db/db';


export const createUser = async (userData: any): Promise<PlatformUser | null> => {
  const db = await openDb();
  
  try {
    // 1. Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 2. Insert the new user into the database
    // The 'id', 'createdAt', and 'updatedAt' are handled automatically by SQLite
    const result = await db.run(
      `INSERT INTO users (email, password, firstName, lastName, acceptsMarketing, displayName, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.email,
        hashedPassword,
        userData.firstName || null,
        userData.lastName || null,
        userData.acceptsMarketing || false,
        userData.displayName || null,
        userData.phone || null
      ]
    );
    
    // 3. Retrieve and return the newly created user using the auto-generated ID
    const newUser = await db.get<PlatformUser>('SELECT * FROM users WHERE id = ?', result.lastID);
    
    await db.close();
    return newUser || null;
    
  } catch (error) {
    await db.close();
    console.error('Error creating user:', error);
    throw error; // Let the controller handle the error (e.g., if email already exists)
  }
};