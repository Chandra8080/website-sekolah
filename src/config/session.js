import session from 'express-session';
import memorystore from 'memorystore';

const MemoryStore = memorystore(session);

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'school-default-super-secret-key-change-it',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
};

export default sessionConfig;
