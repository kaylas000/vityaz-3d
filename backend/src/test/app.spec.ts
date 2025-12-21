import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AppService } from '../app.service';

describe('AppModule (e2e)', () => {
  let app: any;
  let service: AppService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    service = moduleFixture.get<AppService>(AppService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return hello message', () => {
      const result = service.getHello();
      expect(result.message).toContain('VITYAZ');
      expect(result.status).toBe('READY');
    });
  });
});
