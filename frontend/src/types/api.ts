export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface EventFilters {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  eventType?: 'solo' | 'team';
}

export interface RegistrationFormData {
  eventId: string;
  ticketType: string;
  quantity: number;
  utrNumber: string;
  paymentScreenshot: File;
  teamName?: string;
  teamMembers?: string[];
  attendeeInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ActivityLog {
  _id: string;
  action: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  targetUser?: any;
  targetEvent?: any;
  targetRegistration?: any;
  details?: any;
  timestamp: string;
}
