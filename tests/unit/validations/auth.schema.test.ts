import { z } from 'zod';

// Auth validation schemas (to be created in src/lib/validations/auth.schema.ts)
const registerSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis').max(50),
  last_name: z.string().min(1, 'Le nom est requis').max(50),
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirm_password: z.string(),
  date_of_birth: z.string().refine(date => {
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }, 'Vous devez avoir au moins 18 ans'),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
  institution: z.string().min(1, 'L\'établissement est requis'),
  terms_accepted: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions'),
  privacy_accepted: z.boolean().refine(val => val === true, 'Vous devez accepter la politique de confidentialité'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

const loginSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

describe('Auth validation schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@iut-fv.edu.cm',
        password: 'Password123',
        confirm_password: 'Password123',
        date_of_birth: '2000-01-01',
        gender: 'male' as const,
        institution: 'iut-fv-bandjoun',
        terms_accepted: true,
        privacy_accepted: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        ...validRegisterData(),
        email: 'invalid-email',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('email');
    });

    it('should reject weak password', () => {
      const invalidData = {
        ...validRegisterData(),
        password: 'weak',
        confirm_password: 'weak',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        ...validRegisterData(),
        password: 'Password123',
        confirm_password: 'Password456',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('confirm_password');
    });

    it('should reject underage users', () => {
      const invalidData = {
        ...validRegisterData(),
        date_of_birth: '2010-01-01', // 14 years old
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require terms acceptance', () => {
      const invalidData = {
        ...validRegisterData(),
        terms_accepted: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'jean.dupont@iut-fv.edu.cm',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const invalidData = {
        email: 'jean.dupont@iut-fv.edu.cm',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

function validRegisterData() {
  return {
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@iut-fv.edu.cm',
    password: 'Password123',
    confirm_password: 'Password123',
    date_of_birth: '2000-01-01',
    gender: 'male' as const,
    institution: 'iut-fv-bandjoun',
    terms_accepted: true,
    privacy_accepted: true,
  };
}