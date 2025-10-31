import Credentials from 'next-auth/providers/credentials'
import * as bcrypt from 'bcryptjs'
import prisma from '@/lib/db'

const CredentialsProvider = Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' }
  },
  async authorize(credentials) {
    const email = typeof credentials?.email === 'string' ? credentials.email : '';
    const password = typeof credentials?.password === 'string' ? credentials.password : '';
    if (!email || !password) {
      throw new Error('Please enter an email and password');
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });
    if (!user || !user.password) {
      throw new Error('No user found');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Incorrect password');
    }
    // Return full user object for NextAuth session/JWT
    return {
      id: user.id,
      email: user.email,
      name: user.profile?.name || null,
      profileId: user.profile?.id || null,
    };
  }
})

export default CredentialsProvider;
