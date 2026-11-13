'use client';

import {
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Hash,
  Music,
  Ghost,
  Link,
  User,
} from 'lucide-react';

// Custom icon components for platforms not in lucide-react
export function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className || ''}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.516-4.477-10-10-10zm5.521 17.34c-.106.618-.688 1.034-1.254.927-1.7-.323-4.064-1.735-5.272-3.998-.132-.248-.047-.55.19-.584.204-.03.43.148.474.343.466 2.104 2.236 3.883 4.652 3.924.331.006.555-.338.348-.544z" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className || ''}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.545,1.182c-2.52,0-4.666,1.639-5.327,3.938c-2.244-1.336-5.061-1.316-7.192,0.067c-2.275,1.48-3.065,4.411-1.88,6.84c0.002,0.236,0.243,0.351,0.364,0.187c1.018-1.394,3.399-3.169,5.411-3.367v2.111c0,0.468-0.481,0.437-0.699,0.054c-0.306-0.537-1.463-3.148-3.946-4.048c-1.96-0.712-4.132,0.232-5.497,2.073c-0.896,1.2-1.312,2.858-0.935,4.391c0.033,0.133,0.153,0.239,0.272,0.239c0.135,0,0.255-0.107,0.272-0.239c0.677-2.768,3.238-4.99,5.793-4.99c2.824,0,5.323,2.545,5.586,5.48c0.079,0.884-0.382,1.556-1.127,1.895c-0.208,0.095-0.429,0.144-0.667,0.118c-1.271-0.143-2.594-0.642-3.822-1.465c-0.22-0.146-0.445-0.296-0.678-0.436c-0.286-0.173-0.654,0.015-0.699,0.456c-0.022,0.22,0.181,0.395,0.429,0.361c1.474-0.209,2.754-0.655,3.779-1.271c0.456-0.274,0.667-0.899,0.449-1.411c-0.489-1.146-1.894-1.689-2.969-1.159c-0.222,0.112-0.362,0.371-0.362,0.618c0,0.283,0.21,0.558,0.457,0.654c1.235,0.483,2.537,1.224,3.737,2.237c0.428,0.361,0.871,0.667,1.322,0.917c0.591,0.328,1.153,0.218,1.449-0.178c0.115-0.153,0.29-0.327,0.429-0.361c0.055-0.014,0.109-0.031,0.166-0.047c0.869-0.256,1.732-0.556,2.579-0.863c0.801-0.289,1.241-1.079,1.083-1.885c-0.099-0.511-0.514-0.786-0.94-0.687c-1.902,0.443-4.013,1.133-6.075,1.546c-0.463,0.093-0.726,0.565-0.559,1.009c0.204,0.543,0.784,0.897,1.318,0.897c2.41,0,4.762-0.923,6.484-2.649c0.175-0.175,0.206-0.445,0.09-0.651C16.246,5.917,14.382,3.158,12.545,1.182z" />
    </svg>
  );
}

export const PLATFORM_ICONS = {
  instagram: (props: { className?: string }) => <Instagram {...props} />,
  facebook: (props: { className?: string }) => <Facebook {...props} />,
  twitter: (props: { className?: string }) => <Twitter {...props} />,
  x: (props: { className?: string }) => <Twitter {...props} />,
  snapchat: (props: { className?: string }) => <SnapchatIcon {...props} />,
  tiktok: (props: { className?: string }) => <TikTokIcon {...props} />,
  whatsapp: (props: { className?: string }) => <MessageCircle {...props} />,
  discord: (props: { className?: string }) => <Hash {...props} />,
  other: (props: { className?: string }) => <Link {...props} />,
};

export const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', icon: PLATFORM_ICONS.instagram, color: 'text-pink-500' },
  snapchat: { label: 'Snapchat', icon: PLATFORM_ICONS.snapchat, color: 'text-yellow-400' },
  tiktok: { label: 'TikTok', icon: PLATFORM_ICONS.tiktok, color: 'text-pink-500' },
  facebook: { label: 'Facebook', icon: PLATFORM_ICONS.facebook, color: 'text-blue-500' },
  whatsapp: { label: 'WhatsApp', icon: PLATFORM_ICONS.whatsapp, color: 'text-green-500' },
  discord: { label: 'Discord', icon: PLATFORM_ICONS.discord, color: 'text-indigo-500' },
  x: { label: 'X', icon: PLATFORM_ICONS.x, color: 'text-gray-500' },
  other: { label: 'Autre', icon: PLATFORM_ICONS.other, color: 'text-muted-foreground' },
};