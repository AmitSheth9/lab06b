require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns cafedrinks', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Caffe_Latte',
          price: '3.35',
          calories: 100,
          hotcold: true,
          owner_id:1
      
        },
        {
          id: 2,
          name: 'Caffe_Mocha',
          price: '3.95',
          calories: 200,
          hotcold: true,
          owner_id:1
        },
        {
          id: 3,
          name: 'Caffe_Misto',
          price: '2.85',
          calories: 50,
          hotcold: false,
          owner_id:1
        },
        {
          id:4,
          name: 'Cappucino',
          price: '3.35',
          calories: 70,
          hotcold: false,
          owner_id:1
        },
        {
          id:5,
          name: 'Chai_Tea_Latte',
          price: '3.85',
          calories: 120,
          hotcold: false,
          owner_id:1
        }
      ];

      const data = await fakeRequest(app)
        .get('/cafedrinks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns from id', async() => {
      const expectation =
      {
        
        id: 1,
        name: 'Caffe_Latte',
        price: '3.35',
        calories: 100,
        hotcold: true,
        owner_id: 1
      
        
      };
      const data = await fakeRequest(app)
        .get('/cafedrinks/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('posts a cafe drink', async() => {
      const expectation =
      {
        id: expect.any(Number),
        name: 'Pumpkin Latte',
        price: '4',
        calories: 250,
        hotcold: false,
        owner_id: 1
      };
      const data = await fakeRequest(app)
        .post('/cafedrinks')
        .send({
          name: 'Pumpkin Latte',
          price: 4,
          calories: 250,
          hotcold: false
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('put a cafe drink', async() => {
      const expectation = 
      {
        id: expect.any(Number),
        name: 'frappucino',
        price: '4',
        calories: 300,
        hotcold: true,
        owner_id: 1
      };
      const data = await fakeRequest(app)
        .put('/cafedrinks/3')
        .send({
          name: 'frappucino',
          price: 4,
          calories: 300,
          hotcold: true
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes a cafe drink', async() => {
      const expectation =
      {
        id: expect.any(Number),
        name: 'frappucino',
        price: '4',
        calories: 300,
        hotcold: true,
        owner_id: 1
      };
      const data = await fakeRequest(app)
        .delete('/cafedrinks/3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

    });
  });
});

