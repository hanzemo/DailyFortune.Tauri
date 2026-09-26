/** 共同的用户公开字段 */
export interface UserCommonFields {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  background_url: string;
  registration_date: string;
  last_active_date: string;
  total_draws: number;
  has_drawn_today: boolean;
  todays_fortune: string | null;
  status: string;
  is_hidden: boolean;
  tags: string[];
  qq: number | null;
  use_qq_avatar: boolean;
  streak: number | null;
  fortune_counts: Record<string, number> | null;
}

/** /users/me 返回的完整资料 */
export interface UserMeProfile extends UserCommonFields {
  id: string;
  email: string;
  role: string;
  language: string;
  timezone: string;
}

/** /users/u/{username} 返回的公开资料 */
export type UserPublicProfile = UserCommonFields;

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserMeProfile | null;
}

export interface MyProfileResponse {
  user: UserMeProfile;
  next_draw_at: string | null;
}

export interface RegistrationStatusResponse {
  is_open: boolean;
}

export interface FortuneDrawResponse {
  fortune: string;
  next_draw_at: string | null;
}

export interface FortuneHistoryItem {
  created_at: string;
  value: string;
}

export interface LeaderboardUser {
  username: string;
  display_name: string;
}

export interface LeaderboardGroup {
  fortune: string;
  users: LeaderboardUser[];
}

export interface UserUpdatePayload {
  display_name?: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  background_url?: string;
  language?: string;
  timezone?: string;
  qq?: number | null;
  use_qq_avatar?: boolean;
}

export type LeaderboardPeriod = 'today' | 'week' | 'month' | 'year';
