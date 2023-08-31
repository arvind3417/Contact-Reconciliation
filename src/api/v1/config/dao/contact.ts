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
async function findLinkedContact(email: string , phoneNumber: Number ) {

    
    
    const contacts = await db('Contact').select('*');
    
    const linkedContacts = {};
    
    for (const contact of contacts) {
        const { id, phoneNumber: contactPhoneNumber, email: contactEmail } = contact;
        
        if (contactPhoneNumber || contactEmail) {
            const key = contactPhoneNumber || contactEmail;
            console.log(key);
  
        if (!linkedContacts[key]) {
          linkedContacts[key] = { primary: id, secondary: [] };
        } else {
          linkedContacts[key].secondary.push(id);
        }
      }
    }
  
    for (const key in linkedContacts) {
      const { primary, secondary } = linkedContacts[key];
      console.log(secondary);
      
  
              if (secondary.length > 0) {
            await db('Contact')
            .whereIn('id', secondary)
            .update({ linkedId: primary, linkPrecedence: 'secondary' }).returning('*');
        }
    //   if (secondary.length > 0) {
    //     const linkedId = secondary.includes(primary) ? primary : secondary[0];
    //     const linkedContact = contacts.find(contact => contact.id === linkedId);
  
    //     // Check if the linked contact matches the provided email or phoneNumber
    //     if (
    //       (email && linkedContact.email === email) ||
    //       (phoneNumber && linkedContact.phoneNumber === phoneNumber)
    //     ) {
    //       return linkedContact;
    //     }
    //   }
    }
  
    return null; // Return null if no linked contacts match
  }
  
    // async function linkContacts() {
    //     const contacts = await db('Contact').select('*');
    
    //     const linkedContacts = {};
    
    //     for (const contact of contacts) {
    //     const { id, phoneNumber, email } = contact;
    
    //     if (phoneNumber || email) {
    //         const key = phoneNumber || email;
    //         console.log(key);
            
    
    //         if (!linkedContacts[key]) {
    //             // console.log("here");
    //         linkedContacts[key] = { primary: id, secondary: [] };
    //         } else {
    //         linkedContacts[key].secondary.push(id);
    //         }
    //     }
    //     }
    
    //     for (const key in linkedContacts) {
    //     const { primary, secondary } = linkedContacts[key];
    //     console.log(secondary);
        
    
    //     if (secondary.length > 0) {
    //         await db('Contact')
    //         .whereIn('id', secondary)
    //         .update({ linkedId: primary, linkPrecedence: 'secondary' }).returning('*');
    //     }
    //     }
    
    //     console.log('Contacts linked successfully');
    // }

export {createContact,findLinkedContact}