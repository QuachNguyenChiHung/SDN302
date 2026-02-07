import UserRepo from "../repository/UserRepo.ts";
import bcrypt from 'bcrypt'
class UserService {
    // Create a new user
    async createUser(userData: any) {
        try {
            userData.password = await bcrypt.hash(userData.password, 10);
            return await UserRepo.create(userData);
        } catch (error: any) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Get all users
    async getAllUsers(page: number) {
        try {
            return await UserRepo.findAll(page);
        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    // Get user by ID
    async getUserById(id: string) {
        try {
            const user = await UserRepo.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error: any) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    // Get user by username
    async getUserByUsername(username: string) {
        try {
            const user = await UserRepo.findByUsername(username);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error: any) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    // Update user
    async updateUser(id: string, userData: any) {
        try {
            const user = await UserRepo.update(id, userData);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error: any) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete user
    async deleteUser(id: string) {
        try {
            const user = await UserRepo.delete(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error: any) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
}

export default new UserService()