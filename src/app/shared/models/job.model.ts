export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  contractType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  domain: string;
  skills: string[];
  salary: number;
  description: string;
  posterId: string;
  posterName: string;
  createdAt: Date;
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
