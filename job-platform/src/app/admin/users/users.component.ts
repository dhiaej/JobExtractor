import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataService } from '../../shared/services/data.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  dataSource!: MatTableDataSource<User>;
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];

  // Summary data
  totalUsers = 0;
  activeUsers = 0;
  offererUsers = 0;
  seekerUsers = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.dataService.getUsers().subscribe(users => {
      this.users = users;
      this.dataSource = new MatTableDataSource(users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      // Calculate summary data
      this.totalUsers = users.length;
      this.activeUsers = users.filter(u => u.active).length;
      this.offererUsers = users.filter(u => u.role === 'OFFERER').length;
      this.seekerUsers = users.filter(u => u.role === 'SEEKER').length;
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.active ? 'deactivate' : 'activate';
    const confirmMessage = `Are you sure you want to ${action} ${user.name}?`;
    
    if (confirm(confirmMessage)) {
      this.dataService.updateUserStatus(user.id.toString(), !user.active).subscribe({
        next: () => {
          user.active = !user.active;
          this.activeUsers = this.users.filter(u => u.active).length;
          alert(`User ${user.name} has been ${action}d successfully`);
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          alert('Error updating user status');
        }
      });
    }
  }

  viewUserDetails(user: User): void {
    const details = `
User Details:
Name: ${user.name}
Email: ${user.email}
Role: ${user.role}
Status: ${user.active ? 'Active' : 'Inactive'}
    `;
    alert(details);
  }

  editUser(user: User): void {
    // In a real app, this would open an edit dialog
    alert(`Edit user: ${user.name}\n\nThis would open an edit form for the user.`);
  }
}
