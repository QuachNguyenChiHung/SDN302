import UserRepo from "../repository/UserRepo.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
class AuthService {
    async login(username: string, password: string) {
        const user = await UserRepo.findByUsername(username);
        if (!user) return null;
        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) return null;
        const payload = { id: user._id, username: username, isAdmin: user.isAdmin };
        const token = jwt.sign(payload, "I spent five nights at Freddy", { expiresIn: '1h' });
        console.log("my token: " + token);
        return token;
    }
}
export default new AuthService();