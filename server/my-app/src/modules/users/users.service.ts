import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    private prisma = new PrismaClient();

    async createUser(data: CreateUserDto): Promise<User> {
        return this.prisma.user.create({
            data: {

                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role,
                phone: data.phone,
            },
        });
    }

    async getUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async getUserById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async updateUser(id: number, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
        return this.prisma.user.update({ where: { id }, data });
    }

    async deleteUser(id: number): Promise<User> {
        return this.prisma.user.delete({ where: { id } });
    }
}
