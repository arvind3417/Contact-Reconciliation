import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('Contact', function (table) {
        table.increments('id').primary();
        table.string('phoneNumber');
        table.string('email');
        table.integer('linkedId').unsigned().nullable();
        table.enum('linkPrecedence', ['secondary', 'primary']).notNullable();        // table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
        // table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
        table.timestamps(true, true);
        table.dateTime('deletedAt').nullable();
        
        // Add foreign key constraint to link contacts
        table.foreign('linkedId').references('id').inTable('Contact');
      });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('Contact');
}

