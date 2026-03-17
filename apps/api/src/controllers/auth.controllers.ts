import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PlatformUser } from "@enterprise-commerce/core/platform/types"
import { createUser } from "../models/User"

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    
    const userData = {
      email,
      password,
      firstName,
      lastName
    };

    
    const createdUser = await createUser(userData);

    
    res.status(201).json({ 
      message: 'You have successfully signed up! You can now log in', 
      user: createdUser 
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    
    // Check if the error is due to a duplicate email (SQLite UNIQUE constraint)
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE')) {
      res.status(409).json({ message: 'A user with this email already exists' });
      return;
    }

    res.status(500).json({ message: 'Internal server error during registration' });
  }
};