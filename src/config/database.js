// JSON file-based database — no MySQL required
export {
  default as db,
  default as prisma,
  dbFindMany,
  dbFindFirst,
  dbFindUnique,
  dbCreate,
  dbUpdate,
  dbDelete,
  dbCount,
  dbUpsert,
  dbDeleteMany,
  dbUpdateMany
} from './db.js';

import db from './db.js';
export default db;
