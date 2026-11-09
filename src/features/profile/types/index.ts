export type DayOfWeek =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

export interface AvailabilitySlotDto {
  id: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface StudentProfileDto {
  userId: string;
  name: string;
  email: string;
  bio: string | null;
  major: string | null;
  academicCycle: string | null;
  profilePhotoUrl: string | null;
  skills: string[];
  interests: string[];
  availabilities: AvailabilitySlotDto[];
  updatedAt: string;
}

export interface UpdateProfileRequest {
  bio?: string | null;
  major?: string | null;
  academicCycle?: string | null;
  profilePhotoUrl?: string | null;
  skills?: string[];
  interests?: string[];
}

export interface CreateAvailabilityRequest {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export type UpdateAvailabilityRequest = Partial<CreateAvailabilityRequest>;

export interface AvailabilityActionResponse {
  message: string;
  availability: AvailabilitySlotDto;
}

export interface DeleteAvailabilityResponse {
  message: string;
  deletedId: string;
}
