export interface LifecycleStatus {
  instance_id: string;
  instance_name: string | null;
  created_at: number; // Unix timestamp
  expires_at: number; // Unix timestamp
  email_status: "none" | "sent" | "extended" | "deleted";
  email_sent_at: number | null;
  extended: boolean;
  remaining_seconds: number; // 음수이면 이미 만료
}
