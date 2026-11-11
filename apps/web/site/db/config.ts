 
import { column, defineDb, defineTable, NOW } from 'astro:db';

const ContactSubmission = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    createdAt: column.date({ default: NOW }),
    email: column.text(),
    locale: column.text({ enum: ['en', 'es'] }),
    message: column.text(),
    name: column.text(),
    type: column.text({ enum: ['consulting', 'speaking', 'fulltime', 'other'] }),
  },
  indexes: [{ on: ['createdAt'] }, { on: ['email'] }, { on: ['locale', 'createdAt'] }],
});

export default defineDb({
  tables: { ContactSubmission },
});

export { ContactSubmission };
