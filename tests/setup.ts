// Test setup file
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Next.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      count: jest.fn().mockReturnThis(),
      head: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn(),
      track: jest.fn(),
      untrack: jest.fn(),
    })),
    removeChannel: jest.fn(),
  }),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    promise: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const icons = {};
  const iconNames = [
    'Heart', 'Users', 'MessageSquare', 'Shield', 'Settings', 'LogOut', 'ChevronLeft', 'ChevronRight',
    'Search', 'Filter', 'MoreVertical', 'CheckCircle2', 'XCircle', 'Clock', 'UserPlus', 'Ban',
    'Mail', 'Edit', 'Trash2', 'Eye', 'Loader2', 'FileText', 'Download', 'Upload', 'ExternalLink',
    'Calendar', 'Star', 'MapPin', 'GraduationCap', 'BookOpen', 'Briefcase', 'Camera', 'X',
    'Plus', 'AlertCircle', 'AlertTriangle', 'CheckCircle2', 'Moon', 'Sun', 'Monitor', 'Lock',
    'Trash2', 'Bell', 'Palette', 'DollarSign', 'BarChart3', 'Play', 'Pause', 'Globe', 'Sparkles',
    'ArrowRight', 'Instagram', 'Facebook', 'Twitter', 'Linkedin', 'Ghost', 'Music', 'Hash',
    'Plane', 'Backpack', 'Car', 'Tent', 'Languages', 'Utensils', 'HeartHandshake', 'Scale',
    'PawPrint', 'GraduationCap', 'HeartPulse', 'Package', 'ChefHat', 'Cake', 'Pen', 'Video',
    'Mic', 'Hammer', 'Sprout', 'ShoppingBag', 'Sparkles', 'Home', 'Archive', 'MoreHorizontal',
    'Cpu', 'Code', 'Shield', 'Database', 'Globe', 'Smartphone', 'Wifi', 'Bot', 'Bitcoin', 'Headset',
    'Atom', 'FlaskConical', 'Dna', 'Calculator', 'Star', 'Leaf', 'Music', 'Film', 'Tv', 'Drama',
    'Zap', 'Palette', 'Camera', 'PenTool', 'Shirt', 'Building2', 'BookOpen', 'Feather', 'Landmark',
    'Brain', 'Building', 'Monument', 'Football', 'Basketball', 'Volleyball', 'Tennis', 'Waves',
    'Running', 'Dumbbell', 'Flower2', 'Sparkle', 'Mountain', 'Bike', 'Fist', 'Gamepad2', 'Gamepad',
    'Puzzle', 'Dice', 'Mask', 'Rocket', 'TrendingUp', 'Megaphone', 'ClipboardList', 'Users',
    'Lightbulb', 'Briefcase', 'Coins', 'Wallet', 'Handshake', 'Plane', 'Backpack', 'Car', 'Tent',
    'Globe', 'Camera', 'Apple', 'HeartHandshake', 'Scale', 'PawPrint', 'GraduationCap',
    'HeartPulse', 'Package', 'Ghost', 'Music', 'Film', 'Tv', 'Drama', 'Zap', 'Palette',
    'Camera', 'PenTool', 'Shirt', 'Building2', 'BookOpen', 'Feather', 'Landmark', 'Brain',
    'Building', 'Monument', 'Football', 'Basketball', 'Volleyball', 'Tennis', 'Waves',
    'Running', 'Dumbbell', 'Flower2', 'Sparkle', 'Mountain', 'Bike', 'Fist', 'Gamepad2',
    'Gamepad', 'Puzzle', 'Dice', 'Mask', 'Rocket', 'TrendingUp', 'Megaphone', 'ClipboardList',
    'Users', 'Lightbulb', 'Briefcase', 'Coins', 'Wallet', 'Handshake', 'Plane', 'Backpack',
    'Car', 'Tent', 'Globe', 'Camera', 'Apple', 'CheckCircle2', 'XCircle', 'Clock', 'FileText',
    'Eye', 'Download', 'Upload', 'ExternalLink', 'Calendar', 'Star', 'MapPin', 'GraduationCap',
    'BookOpen', 'Briefcase', 'Camera', 'X', 'Plus', 'AlertCircle', 'AlertTriangle', 'CheckCircle2',
    'Moon', 'Sun', 'Monitor', 'Lock', 'Trash2', 'Bell', 'Palette', 'DollarSign', 'BarChart3',
    'Play', 'Pause', 'Globe', 'Sparkles', 'ArrowRight', 'Instagram', 'Facebook', 'Twitter',
    'Linkedin', 'Ghost', 'Music', 'Hash', 'Plane', 'Backpack', 'Car', 'Tent', 'Languages',
    'Utensils', 'HeartHandshake', 'Scale', 'PawPrint', 'GraduationCap', 'HeartPulse', 'Package',
    'ChefHat', 'Cake', 'Pen', 'Video', 'Mic', 'Hammer', 'Sprout', 'ShoppingBag', 'Sparkles',
    'Home', 'Archive', 'MoreHorizontal', 'Cpu', 'Code', 'Shield', 'Database', 'Globe',
    'Smartphone', 'Wifi', 'Bot', 'Bitcoin', 'Headset', 'Atom', 'FlaskConical', 'Dna',
    'Calculator', 'Star', 'Leaf', 'Music', 'Film', 'Tv', 'Drama', 'Zap', 'Palette', 'Camera',
    'PenTool', 'Shirt', 'Building2', 'BookOpen', 'Feather', 'Landmark', 'Brain', 'Building',
    'Monument', 'Football', 'Basketball', 'Volleyball', 'Tennis', 'Waves', 'Running', 'Dumbbell',
    'Flower2', 'Sparkle', 'Mountain', 'Bike', 'Fist', 'Gamepad2', 'Gamepad', 'Puzzle', 'Dice',
    'Mask', 'Rocket', 'TrendingUp', 'Megaphone', 'ClipboardList', 'Users', 'Lightbulb', 'Briefcase',
    'Coins', 'Wallet', 'Handshake', 'Plane', 'Backpack', 'Car', 'Tent', 'Globe', 'Camera',
    'Apple',
  ];

  iconNames.forEach(name => {
    icons[name] = ({ className, ...props }: any) => (
      <svg className={className} {...props} data-testid={`icon-${name.toLowerCase()}`} />
    );
  });

  return icons;
});

// Mock Radix UI components
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children }: any) => <>{children}</>,
}));

jest.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open, onOpenChange }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Portal: ({ children }: any) => <>{children}</>,
  Close: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Overlay: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  Description: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}));

jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="dropdown-content">{children}</div>,
  Item: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Separator: () => <hr />,
  Label: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  CheckboxItem: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  RadioItem: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Separator: () => <hr />,
  Shortcut: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Group: ({ children }: any) => <div>{children}</div>,
  Portal: ({ children }: any) => <>{children}</>,
  Sub: ({ children }: any) => <div>{children}</div>,
  SubContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SubTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@radix-ui/react-toast', () => ({
  Provider: ({ children }: any) => <>{children}</>,
  Viewport: ({ children }: any) => <div>{children}</div>,
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Description: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Close: ({ ...props }: any) => <button {...props} />,
  Action: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: any) => <>{children}</>,
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children }: any) => <span>{children}</span>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@radix-ui/react-popover', () => ({
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children }: any) => <span>{children}</span>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@radix-ui/react-sheet', () => ({
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Close: ({ ...props }: any) => <button {...props} />,
  Portal: ({ children }: any) => <>{children}</>,
  Overlay: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Header: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Footer: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  Description: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}));

jest.mock('@radix-ui/react-scroll-area', () => ({
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Viewport: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ScrollAreaScrollbar: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ScrollAreaThumb: ({ ...props }: any) => <div {...props} />,
  Corner: () => <div />,
}));

jest.mock('@radix-ui/react-navigation-menu', () => ({
  Root: ({ children }: any) => <nav>{children}</nav>,
  List: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
  Item: ({ children }: any) => <li>{children}</li>,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  Viewport: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Indicator: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@radix-ui/react-select', () => ({
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Value: ({ children }: any) => <span>{children}</span>,
  Icon: ({ children }: any) => <span>{children}</span>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Viewport: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ItemText: ({ children }: any) => <span>{children}</span>,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
  Separator: () => <hr />,
  Label: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ScrollUpButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  ScrollDownButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Group: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  List: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@radix-ui/react-switch', () => ({
  Root: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Thumb: () => <span />,
}));

jest.mock('@radix-ui/react-checkbox', () => ({
  Root: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Indicator: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@radix-ui/react-radio-group', () => ({
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Indicator: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@radix-ui/react-progress', () => ({
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Indicator: ({ ...props }: any) => <div {...props} />,
}));

jest.mock('@radix-ui/react-separator', () => ({
  Root: ({ ...props }: any) => <hr {...props} />,
}));

jest.mock('@radix-ui/react-avatar', () => ({
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Image: ({ ...props }: any) => <img {...props} />,
  Fallback: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null, refetch: jest.fn() })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false, isError: false, isSuccess: false })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }: any) => <>{children}</>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => 'il y a 5 min'),
}));

jest.mock('date-fns/locale', () => ({
  fr: {},
}));

// Mock clsx and tailwind-merge
jest.mock('clsx', () => (...args: any[]) => args.filter(Boolean).join(' '));
jest.mock('tailwind-merge', () => ({
  twMerge: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Suppress console.error in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) return;
    if (args[0]?.includes?.('act(...)')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});