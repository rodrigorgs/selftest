import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/apiUtils";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function UsersPage() {

  async function fetchUsers() {
    'use server';
    const currentUser = await getCurrentUser();
    if (!currentUser.admin) {
      throw new Error("Unauthorized");
    }
    
    return prisma.user.findMany();
  }

  const users = await fetchUsers();

  return (
    <div>
      <h1>Users</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">ID</TableHead>
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Is Admin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.admin ? "Yes" : "No"}</TableCell>
              {/* Link to see questions */}
              <TableCell>
                <Link href={`/questions?userId=${user.id}`} className="text-blue-500 hover:underline">
                  View Questions
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}