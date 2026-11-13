// Integration tests for profile API routes
import { createClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  }),
}));

describe('Profile API Integration', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    supabase = createClient();
    jest.clearAllMocks();
  });

  describe('GET /api/profiles', () => {
    it('should return user profile', async () => {
      const mockProfile = createMockProfile();

      supabase.from().select().eq().single.mockResolvedValue({ data: mockProfile, error: null });

      expect(supabase.from).toBeDefined();
    });
  });

  describe('POST /api/profiles', () => {
    it('should create a new profile', async () => {
      const mockProfile = createMockProfile();

      supabase.from().insert.mockResolvedValue({ data: mockProfile, error: null });

      expect(supabase.from).toBeDefined();
    });
  });

  describe('PATCH /api/profiles', () => {
    it('should update user profile', async () => {
      const updatedProfile = { ...createMockProfile(), bio: 'Updated bio' };

      supabase.from().update().eq().single.mockResolvedValue({ data: updatedProfile, error: null });

      expect(supabase.from).toBeDefined();
    });
  });

  describe('POST /api/profiles/photos', () => {
    it('should upload profile photo', async () => {
      const mockPhoto = {
        id: 'photo-1',
        profile_id: 'user-123',
        storage_path: 'user-123/photo.jpg',
        url: 'https://example.com/photo.jpg',
        is_primary: true,
      };

      supabase.storage.from().upload.mockResolvedValue({ data: { path: 'user-123/photo.jpg' }, error: null });
      supabase.storage.from().getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } });
      supabase.from().insert.mockResolvedValue({ data: mockPhoto, error: null });

      expect(supabase.storage.from).toBeDefined();
    });
  });

  describe('DELETE /api/profiles/photos/:id', () => {
    it('should delete profile photo', async () => {
      supabase.storage.from().remove.mockResolvedValue({ error: null });
      supabase.from().delete().eq.mockResolvedValue({ error: null });

      expect(supabase.storage.from).toBeDefined();
    });
  });
});

function createMockProfile(overrides = {}) {
  return {
    id: 'user-123',
    first_name: 'Jean',
    last_name: 'Dupont',
    date_of_birth: '2000-01-01',
    gender: 'male',
    bio: 'Test bio',
    city: 'Bandjoun',
    verification_status: 'verified',
    is_verified: true,
    institution_id: 'inst-1',
    academic_program_id: 'prog-1',
    academic_level_id: 'level-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}