import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const createPasswordHash = async (passowrd: string) => {
	return await bcrypt.hash(passowrd, SALT_ROUNDS);
};

export const comparePassword = async (incomingPassword: string, savedPassword: string) => {
	return await bcrypt.compare(incomingPassword, savedPassword);
};
