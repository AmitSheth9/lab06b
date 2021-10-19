
const client = require('../lib/client');
// import our seed data:
const { cafedrinks } = require('./cafedrinks.js');
const { hotcolddata } = require('./hotcold.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      hotcolddata.map(category => {
        return client.query(`INSERT INTO categories (category)
        VALUES ($1);
        `,
        [category.category]);
      })
    );

    await Promise.all(
      cafedrinks.map(drink => {
        return client.query(`
                    INSERT INTO cafedrinks (name, price, calories, category_id, image, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [drink.name, drink.price, drink.calories, drink.category_id, drink.image, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
