
import db from "../knex-db";

interface Contact {
    phoneNumber?: string;
    email?: string;
    linkedId?: number | null;
    linkPrecedence: 'secondary' | 'primary';
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }
  
  export default Contact;

async function createContact( data) {


  const res = await db('Contact')
    .insert(data,'*')
    console.log(res);
    
    return res;
}
async function updateContact(data){
  const query = db('Contact').where('id', data.id).update({
    linkedId: data.linkedId,
    linkPrecedence:data.linkPrecedence,
    updated_at: new Date()
  }
  ).returning('*');
  return query;
  

  
}

export {createContact,updateContact}