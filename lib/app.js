const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/cafedrinks', async(req, res) => {
  try {
    const data = await client.query(`SELECT 
    cafedrinks.id,
    name,
    price,
    calories,
    category
    FROM cafedrinks
    JOIN categories
    ON cafedrinks.category_id = categories.id`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async(req, res) => {
  try {
    const data = await client.query(`SELECT * 
  FROM categories`);

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/cafedrinks/:id', async(req, res) => {
  try{
    const data = await client.query(`SELECT cafedrinks.id,
    name,
    price,
    calories,
    category
    FROM cafedrinks
    JOIN categories
    ON cafedrinks.category_id = categories.id
    WHERE cafedrinks.id=$1`, [req.params.id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/cafedrinks', async(req, res)=> {
  try{
    console.log(req.body);
    const data = await client.query(`INSERT INTO cafedrinks (name, price, calories, category_id, owner_id)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `, [req.body.name, req.body.price, req.body.calories, req.body.category_id, 1]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
  
});

app.post('/categories', async(req, res) => {
  try {
    const data = await client.query(`Insert into categories (category)
    Values($1)
    RETURNING * `, [req.body.category]);
    res.json(data.rows);
  }catch(e) {
    res.status(500).json({ error: e.message});
  }
});

app.put('/cafedrinks/:id', async(req, res)=> {
  try{
    const data = await client.query(`UPDATE cafedrinks
    SET name=$1, price=$2, calories=$3, category_id=$4, 
    WHERE id=$5 
    RETURNING *`, [req.body.name, req.body.price, req.body.calories, req.body.category_id, req.params.id]);
    res.json(data.rows[0]);
  }catch(e) {
    res.status(500).json({ error: e.message });
  }
  
});

app.delete('/cafedrinks/:id', async (req, res)=> {
  try {
    const data = await client.query(`DELETE FROM cafedrinks
  WHERE id = $1
  RETURNING *`, [req.params.id]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
