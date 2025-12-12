import { Test, TestingModule } from '@nestjs/testing';
import { CombatService } from './combat.service';

describe('CombatService', () => {
  let service: CombatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombatService],
    }).compile();

    service = module.get<CombatService>(CombatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDamage', () => {
    it('should calculate base damage correctly', () => {
      const damage = service.calculateDamage({
        baseDamage: 50,
        distance: 10,
        bodyPart: 'torso',
        weaponType: 'rifle',
        armor: 0,
      });

      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(50);
    });

    it('should apply distance modifier', () => {
      const closeDamage = service.calculateDamage({
        baseDamage: 50,
        distance: 5,
        bodyPart: 'torso',
        weaponType: 'rifle',
        armor: 0,
      });

      const farDamage = service.calculateDamage({
        baseDamage: 50,
        distance: 50,
        bodyPart: 'torso',
        weaponType: 'rifle',
        armor: 0,
      });

      expect(closeDamage).toBeGreaterThan(farDamage);
    });

    it('should apply body part multiplier', () => {
      const headDamage = service.calculateDamage({
        baseDamage: 50,
        distance: 10,
        bodyPart: 'head',
        weaponType: 'rifle',
        armor: 0,
      });

      const torsoDamage = service.calculateDamage({
        baseDamage: 50,
        distance: 10,
        bodyPart: 'torso',
        weaponType: 'rifle',
        armor: 0,
      });

      expect(headDamage).toBeGreaterThan(torsoDamage);
    });

    it('should apply armor reduction', () => {
      const noArmorDamage = service.calculateDamage({
        baseDamage: 50,
        distance: 10,
        bodyPart: 'torso',
        weaponType: 'rifle',
        armor: 0,
      });

      const withArmorDamage = service.calculateDamage({
        baseDamage: 50,
        distance: 10,
        bodyPart: 'torso',
        weaponType: 'rifle',
        armor: 50,
      });

      expect(withArmorDamage).toBeLessThan(noArmorDamage);
    });

    it('should not exceed 100% damage reduction', () => {
      const damage = service.calculateDamage({
        baseDamage: 50,
        distance: 10,
        bodyPart: 'torso',
        weaponType: 'rifle',
        armor: 200,
      });

      expect(damage).toBeGreaterThan(0);
    });
  });

  describe('processHit', () => {
    it('should return kill status when health reaches 0', () => {
      const result = service.processHit({
        targetHealth: 10,
        damage: 15,
        isHeadshot: false,
      });

      expect(result.newHealth).toBe(0);
      expect(result.isKill).toBe(true);
    });

    it('should reduce health correctly', () => {
      const result = service.processHit({
        targetHealth: 100,
        damage: 30,
        isHeadshot: false,
      });

      expect(result.newHealth).toBe(70);
      expect(result.isKill).toBe(false);
    });

    it('should apply headshot bonus', () => {
      const normalHit = service.processHit({
        targetHealth: 100,
        damage: 30,
        isHeadshot: false,
      });

      const headshotHit = service.processHit({
        targetHealth: 100,
        damage: 30,
        isHeadshot: true,
      });

      expect(headshotHit.newHealth).toBeLessThan(normalHit.newHealth);
    });
  });
});
