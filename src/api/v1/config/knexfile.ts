// import type { Knex } from "knex";

// // Update with your config settings.

// const config: { [key: string]: Knex.Config } = {
//   development: {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
//   },

//   staging: {
//     client: "postgresql",
//     connection: {
//       database: "my_db",
//       user: "username",
//       password: "password"
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: "knex_migrations"
//     }
//   },

//   production: {
//     client: "postgresql",
//     connection: {
//       database: "my_db",
//       user: "username",
//       password: "password"
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: "knex_migrations"
//     }
//   }

// };

// module.exports = config;
import type { Knex } from "knex";
import dotenv from 'dotenv'; 
dotenv.config();
// dotenv.config();

// import path from "path";



// Update with your config settings.
interface IknexConfig{
  [key:string]:Knex.Config
}

 const configs: IknexConfig = {
  development: {
    client: 'pg',
    // connection: process.env.DB_URL,
    pool: {
      min: 0,
      max: 7,
      acquireTimeoutMillis: 300000,
      createTimeoutMillis: 300000,
      destroyTimeoutMillis: 50000,
      idleTimeoutMillis: 300000,
      reapIntervalMillis: 10000,
      createRetryIntervalMillis: 2000,
      propagateCreateError: false,
    },
    acquireConnectionTimeout: 60000,
    
    connection: {
      database:"test1",
      user:"postgres",
      password:"1234"
    },
    searchPath: ['knex', 'public'],
    migrations: {
      directory:'./migrations',
    },
    seeds: { directory: './seeds' },
  },

  testing: {
    client: 'pg',
    // connection: process.env.DB_URL,
    connection: {
      database:"test1",
      user:"postgres",
      password:"1234"
    },
    searchPath: ['knex', 'public'],
    migrations: {
      directory: './migrations',

      // directory: './migrations',
    },
    seeds: { directory: './seeds' },
  },

  production: {
    client: 'pg',
    // connection: process.env.DB_URL,
    connection: {
      database:"test1",
      user:"postgres",
      password:"1234"
    },
    searchPath: ['knex', 'public'],
    migrations: {
      directory: './migrations',
    },
    seeds: { directory:'./seeds'},
  },

};
export default configs
