export interface JobPosting {
  id: number;
  title: string;
  company: string;
  location: string;
  contractType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  domain: string;
  skills: string[];
  salary: string;
  description: string;
  offererId: number;
  offererName: string;
  createdAt: string;
  isActive: boolean;
}

export interface JobSearchFilters {
  keyword?: string;
  domain?: string;
  location?: string;
  contractType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
