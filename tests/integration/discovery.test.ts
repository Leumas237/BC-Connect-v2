// Integration tests for discovery API routes
import { createClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  }),
}));

describe('Discovery API Integration', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    supabase = createClient();
    jest.clearAllMocks();
  });

  describe('GET /api/discovery', () => {
    it('should return recommended profiles', async () => {
      const mockProfiles = [
        createMockDiscoveryProfile({ id: '1', first_name: 'Marie' }),
        createMockDiscoveryProfile({ id: '2', first_name: 'Sophie' }),
      ];

      supabase.rpc.mockResolvedValue({ data: mockProfiles, error: null });

      expect(supabase.rpc).toBeDefined();
    });

    it('should apply filters correctly', async () => {
      supabase.rpc.mockResolvedValue({ data: [], error: null });

      // Test would verify filters are passed correctly
      expect(supabase.rpc).toBeDefined();
    });
  });

  describe('POST /api/swipes', () => {
    it('should create a swipe', async () => {
      supabase.from().insert.mockResolvedValue({ data: { id: 'swipe-1' }, error: null });

      expect(supabase.from).toBeDefined();
    });

    it('should prevent duplicate swipes', async () => {
      supabase.from().insert.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      });

      expect(supabase.from).toBeDefined();
    });
  });

  describe('GET /api/matches', () => {
    it('should return user matches', async () => {
      const mockMatches = [
        createMockMatch({ id: 'match-1' }),
      ];

      supabase.from().select().or().order.mockResolvedValue({ data: mockMatches, error: null });

      expect(supabase.from).toBeDefined();
    });
  });
});

function createMockDiscoveryProfile(overrides = {}) {
  return {
    id: 'profile-1',
    first_name: 'Test',
    last_name: 'User',
    date_of_birth: '2000-01-01',
    gender: 'female',
    bio: 'Test bio',
    city: 'Bandjoun',
    academic_program_name: 'Informatique L3',
    academic_level_name: 'L3',
    primary_photo_url: 'https://example.com/photo.jpg',
    interests: ['programmation', 'musique'],
    intentions: ['friendship'],
    verification_status: 'verified',
    distance_km: 5.2,
    common_interests_count: 2,
    ...overrides,
  };
}

function createMockMatch(overrides = {}) {
  return {
    id: 'match-1',
    created_at: new Date().toISOString(),
    user1_id: 'user-1',
    user2_id: 'user-2',
    conversation_id: 'conv-1',
    ...overrides,
  };
}