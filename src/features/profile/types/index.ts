export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Profile {
  user_id: string;
  name: string;
  bio: string;
  major: string;
  academic_cycle: number;
  photo_url?: string;
  skills: string[];
  interests: string[];
  availability: Availability[];
  rating?: number;
}
