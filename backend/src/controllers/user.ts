import { PrismaClient } from "@prisma/client";
import { userSchema } from "../zodSchema/userSchema";
import { Request, Response } from "express";
import express from "express"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();

const router = express.Router();

export async function Register (req: Request, res: Response) {
    const { success } = userSchema.safeParse(req.body);
    if (!success) {
      res.status(403).json({ msg: "Inputs are incorrect" });
    } else {
      try {
        const isUserExists = await prisma.user.findUnique({
          where: {
            name: req.body.name,
            email: req.body.email,
          }
        });
  
        if (isUserExists) {
          res.status(400).json({ msg: "User already Exists!" });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await prisma.user.create({
          data: {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
          },
        });
        const token = jwt.sign(
          { id: newUser.id },
          process.env.JWT_SECRET as string
        );
        /*const isEmailSent = await sendEmail(req.body.email);
        
        if (!isEmailSent.success) {
          return res.status(500).json({ error: "Error sending email" });
        }*/
       console.log("token ..... ", token, "user..... ", newUser)
        res
          .status(201)
          .cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
            secure: process.env.NODE_ENV === "Development" ? false : true,
          })
          .json({
            success: true,
            message: "User Created Successfully!",
          });
      } catch (error: unknown) {
        const zodError = error as z.ZodError;
        res.status(400).json({ error: zodError.errors });
      }
    }
  
  }


  export async function Login (req: Request, res: Response) {
    const { email, password } = req.body;
    
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    
    if (!user) {
      return res.status(400).json({ error: "Invalid email!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(400).json({ error: "Invalid  password!" });
  
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string
    );
    
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
        path: '/'
      })
      .json({
        success: true,
        message: "User Logged in!",
      });
  
  }

  export async function Logout (req: Request, res: Response) {
    const token = req.cookies.token;
    console.log("Token from cookies:", token);
  
    res.status(200).cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV !== "Development",
    }).json({
      message: "Logged out!",
      token
    });
  }

  export async function deleteAccount (req: Request, res: Response) {
    const { id } = req.params;
    const user = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json({ user });
  }

  export async function Profile (req:Request, res:Response) {
    try {
      res.status(200).json({authenticated:true})
    } catch (error) {
      res.status(500).json({authenticated:false, error})
    }
  }