import React from 'react';
import type { User } from '../../../types/entities';
import { UserActions } from './UserActions';

// --- UI Components (có thể tách ra file riêng nếu cần) ---
const Table = ({ children }: { children: React.ReactNode }) => <table className="min-w-full divide-y divide-gray-200">{children}</table>;
const TableHeader = ({ children }: { children: React.ReactNode }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }: { children: React.ReactNode }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
const TableRow = ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>;
const TableHead = ({ children }: { children: React.ReactNode }) => <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
const TableCell = ({ children }: { children: React.ReactNode }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>;
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>{children}</span>;

interface UserListTableProps {
  users: User[];
  currentUser: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleActive: (user: User) => void;
}

export const UserListTable: React.FC<UserListTableProps> = ({ users, currentUser, onView, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>
              <span className="sr-only">Hành động</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-500">{user.email}</div>
              </TableCell>
              <TableCell><span className="capitalize">{user.role}</span></TableCell>
              <TableCell>
                {user.is_active ? (
                  <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Đã khóa</Badge>
                )}
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString('vi-VN')}</TableCell>
              <TableCell>
                <UserActions user={user} currentUser={currentUser} onView={onView} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};