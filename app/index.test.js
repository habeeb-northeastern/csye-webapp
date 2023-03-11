const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./index');

chai.use(chaiHttp);
const expect = chai.expect;

describe('/healthz', () => {
  
  afterEach(() => {
    server.close();
    
  });
  it('should return 200 and a JSON object with status property set to "OK"', (done) => {
    chai.request(server)
      .get('/healthz')
      .end((err, res) => {
        expect(res).to.have.status(200);
       
        done();
      });
  });
});
