import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../shared/services/data.service';

interface ActivityItem {
  icon: string;
  text: string;
  time: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // KPI data
  totalUsers = 0;
  totalPostings = 0;
  activeUsers = 0;
  activePostings = 0;

  // Chart data
  usersByRoleData: number[] = [];
  usersByRoleLabels: string[] = [];
  postingsByDomainData: number[] = [];
  postingsByDomainLabels: string[] = [];
  userStatusData: number[] = [];
  userStatusLabels: string[] = [];
  postingsOverTimeData: number[] = [];
  postingsOverTimeLabels: string[] = [];

  // Recent activity
  recentActivity: ActivityItem[] = [];

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.generateRecentActivity();
  }

  private loadDashboardData(): void {
    // Load users data
    this.dataService.getUsers().subscribe(users => {
      this.totalUsers = users.length;
      this.activeUsers = users.filter(u => u.active).length;
      
      // Users by role chart
      this.dataService.getUsersByRole().subscribe(data => {
        this.usersByRoleData = data.map(d => d.count);
        this.usersByRoleLabels = data.map(d => d.role);
      });

      // User status chart
      this.userStatusData = [this.activeUsers, this.totalUsers - this.activeUsers];
      this.userStatusLabels = ['Active', 'Inactive'];
    });

    // Load postings data
    this.dataService.getJobPostings().subscribe(postings => {
      this.totalPostings = postings.length;
      this.activePostings = postings.filter(p => p.isActive).length;
      
      // Postings by domain chart
      this.dataService.getJobPostingsByDomain().subscribe(data => {
        this.postingsByDomainData = data.map(d => d.count);
        this.postingsByDomainLabels = data.map(d => d.domain);
      });

      // Postings over time chart
      this.dataService.getJobPostingsOverTime().subscribe(data => {
        this.postingsOverTimeData = data.map(d => d.count);
        this.postingsOverTimeLabels = data.map(d => d.date);
      });
    });
  }

  private generateRecentActivity(): void {
    const activities: ActivityItem[] = [
      {
        icon: 'person_add',
        text: 'New user registered: John Doe',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        icon: 'work',
        text: 'New job posting created: Senior Developer',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        icon: 'person',
        text: 'User status updated: Jane Smith activated',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        icon: 'delete',
        text: 'Job posting removed: Marketing Manager',
        time: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      },
      {
        icon: 'edit',
        text: 'Job posting updated: UX Designer',
        time: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      }
    ];

    this.recentActivity = activities;
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  viewAllPostings(): void {
    // In a real app, this would navigate to a postings management page
    alert('Viewing all postings - This would open a postings management interface');
  }

  exportData(): void {
    // In a real app, this would export system data
    alert('Exporting system data - This would generate and download a comprehensive report');
  }
}
