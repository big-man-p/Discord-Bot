import { Request, Response } from "express";

function root(req: Request, res: Response): void {
  res.json({ message: "Welcome to the Discord Bot API!" });
}

export default root;