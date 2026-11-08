import { dbCreate } from '../config/database.js';

export async function logActivity({ req, action, module: mod, description }) {
  try {
    const userId = req.session?.user?.id || null;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || null;
    const userAgent = req.headers['user-agent'] || null;

    dbCreate('activity_logs', {
      data: {
        userId,
        action,
        module: mod,
        description: description ? String(description) : null,
        ipAddress: ipAddress ? String(ipAddress).slice(0, 50) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null
      }
    });
  } catch (e) {
    // non-critical
  }
}

export default logActivity;
