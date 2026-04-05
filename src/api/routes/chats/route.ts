import { Request, Response } from "express";
import { getChats } from "../../../bot/handlers/on-message-created";

function chats(req: Request, res: Response): void {
  res.json(getChats());
}

export default chats;