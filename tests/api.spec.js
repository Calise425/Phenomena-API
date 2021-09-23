require('dotenv').config();
const axios = require('axios');
const { SERVER_ADDRESS = 'http://localhost:', PORT = 3000 } = process.env;
const API_URL = process.env.API_URL || SERVER_ADDRESS + PORT;

const { rebuildDB } = require('../db/seed_data');
const { client } = require('../db');

const apiSetup = async () => {
  const reportsToCreate = [
    { title: "floating patronus", location: 'hogwarts', description: 'it seemed to have somewhat of a glow to it', password: 'ExpectoPatronum' }
  ]
  const reportsCreatedDirectly = await Promise.all(reportsToCreate.map(async ({title, location, description, password}) => {
    const {rows: [reportCreated]} = await client.query(`
      INSERT INTO reports (title, location, description, password, "isOpen") VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `, [title, location, description, password]);
    delete reportCreated.password;
    return reportCreated;
  }));
}

describe('API', () => {
  const reportToPost = { title: "Disappearing Being", location: 'Middle Earth', description: 'the little fellow put on a ring, and i swear he disappeared', password: 'FrodoIsMysterious' };
  const commentFieldsToPost = { content: 'he is quite small to hold the one ring to rule them all...' };
  let postedReportResponse, postedCommentResponse;
  beforeAll(async() => {
    await client.connect();
    await rebuildDB();
    await apiSetup();
  })
  afterAll(async() => {
    await client.end();
  })
  describe('server', () => {
    beforeAll(async() => {
    })
    it('Responds to requests', async () => {
      await expect(axios.get(`${API_URL}/foo-bar`)).rejects.toThrow('Request failed with status code 404');
    });
  });
  describe('GET request for /api/reports', () => {
    let response, allReportsResponse, allReportsQueried, singleReportResponse, singleReportQueried;
    beforeAll(async() => {
      const {data} = await axios.get(`${API_URL}/api/reports`);
      response = data;
      const {rows} = await client.query(`
        SELECT * FROM reports
        WHERE "isOpen" = true;
      `);
      allReportsQueried = rows;
      allReportsResponse = response.reports;
      [singleReportResponse] = allReportsResponse;
      [singleReportQueried] = allReportsQueried;
    })
    it('Responds with an object with property, `reports`, which is an array.', async () => {
      expect(response).toEqual(expect.objectContaining({
        reports: expect.any(Array),
      }));
    });
    it('reports array should have all open reports', async () => {
      expect(allReportsResponse.length).toBe(allReportsQueried.length);
    });
    it('reports should reflect those in the database', async () => {
      expect(singleReportResponse).toEqual(expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        location: expect.any(String),
        description: expect.any(String),
        isOpen: expect.any(Boolean),
      }));
      expect(singleReportResponse.description).toEqual(singleReportQueried.description);
      expect(singleReportResponse.title).toEqual(singleReportQueried.title);
      expect(singleReportResponse.location).toEqual(singleReportQueried.location);
    });
  });
  describe('POST request for /api/reports', () => {
    beforeAll(async() => {
    })
    it('on caught error, call next(error), which sends back a 500 error', async () => {
      await expect(axios.post(`${API_URL}/api/reports`, {nothing: undefined})).rejects.toThrow('Request failed with status code 500');
    });
    it('on success, it should send back the object returned by createReport', async () => {
      const {data} = await axios.post(`${API_URL}/api/reports`, reportToPost);
      postedReportResponse = data;
      expect(postedReportResponse.title).toBe(reportToPost.title);
      expect(postedReportResponse.description).toBe(reportToPost.description);
    });
  });
  describe('POST request for /api/reports/:reportId/comments', () => {
    beforeAll(async() => {
    })
    it('on caught error, call next(error), which sends back a 500 error', async () => {
      await expect(axios.post(`${API_URL}/api/reports/${2300}/comments`, {nothing: undefined})).rejects.toThrow('Request failed with status code 500');
    });
    it('on success, it should send back the object returned by createReportComment', async () => {
      const {data, status} = await axios.post(`${API_URL}/api/reports/${postedReportResponse.id}/comments`, commentFieldsToPost);
      postedCommentResponse = data;
      expect(status).toBe(200);
      expect(postedCommentResponse.content).toBe(commentFieldsToPost.content);
    });
  });
  describe('DELETE request for /api/reports/:reportId', () => {
    let deleteResponse;
    beforeAll(async() => {
    })
    it('on caught error, call next(error), which sends back a 500 error', async () => {
      await expect(axios.delete(`${API_URL}/api/reports/${2300}`)).rejects.toThrow('Request failed with status code 500');
    });
    it('it should await a call to closeReport, passing in the reportId from req.params and the password from req.body', async () => {
      const {data, status} = await axios({
        method: 'delete',
        url: `${API_URL}/api/reports/${postedReportResponse.id}`,
        data: {password: reportToPost.password}
      });
      deleteResponse = data;

      const {rows: [report]} = await client.query(`
      SELECT * FROM reports
      WHERE id=$1;
    `,[postedReportResponse.id]);
      
      expect(status).toBe(200);
      expect(report.isOpen).toBe(false);
    });
    it('On success, it should send back the object returned by closeReport', async () => {
      expect(deleteResponse).toEqual({message: 'Report successfully closed!'});
    });
  });
  describe('Properly handles Not Found requests', () => {
    beforeAll(async() => {
    })
    it('Sends back 404 not found', async () => {
      await expect(axios.get(`${API_URL}/foo-bar`)).rejects.toThrow('Request failed with status code 404');
    });
  });
  
});
