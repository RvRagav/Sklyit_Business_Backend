import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mailservice';
import { SklyitUsersService } from '../sklyit_users/sklyit_users.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {}, // Provide a mock implementation here
        },
        {
          provide: MailService,
          useValue: {}, // Provide a mock implementation for MailService
        },
        {
          provide: SklyitUsersService,
          useValue: {}, // Provide a mock implementation for SklyitUsersService
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});