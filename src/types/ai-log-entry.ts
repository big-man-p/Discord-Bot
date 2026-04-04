type AiLogEntry = {
  guid: string;
  timestamp: number;
  username: string;
  userIconUrl: string;
  userType: "user" | "assistant";
  message: string;
  attachments: string[]; // Array of attachment URLs

}