
import knex from 'knex';
import  configs from './knexfile';

const confi = configs[process.env.NODE_ENV || 'development'];
const db = knex(confi);
export default db;