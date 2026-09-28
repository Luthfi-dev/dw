import { SupportedPlatformId } from '../types';

/**
 * Remove tracking and affiliate parameters while preserving critical video query IDs.
 */
export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    
    // Tracking parameters to strip
    const trackingParams = [
      'spm_id_from', 'vd_source', 'spm', 'seid', 'from_source', 'from_spmid',
      'share_source', 'share_medium', 'share_plat', 'share_tag', 'share_from',
      'unique_k', 'buvid', 'is_story_h5', 'up_id', 'utm_source', 'utm_medium',
      'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'utm_name',
      'fbclid', 'gclid', 'dclid', 'msclkid', 'yclid', 'twclid', 'mc_cid',
      'mc_eid', 'igshid', 'igsh', 'si', 'feature', 'pp', 'ab_channel',
      'is_from_webapp', 'sender_device', 'web_id', '_r', 'social_sharing',
      'ref_src', 'ref_url', 'cxt', 'mibextid', 'rdid', 'feed_type'
    ];

    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Identify video provider platform from URL.
 */
export function detectPlatform(url: string): {
  id: SupportedPlatformId;
  name: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  iconName: string;
} {
  const lower = (url || '').toLowerCase();

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return {
      id: 'youtube',
      name: 'YouTube',
      badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400',
      badgeText: 'YouTube',
      accentColor: '#ef4444',
      iconName: 'youtube',
    };
  }
  if (lower.includes('tiktok.com') || lower.includes('douyin.com')) {
    const isDouyin = lower.includes('douyin.com');
    return {
      id: isDouyin ? 'douyin' : 'tiktok',
      name: isDouyin ? 'Douyin (抖音)' : 'TikTok',
      badgeBg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
      badgeText: isDouyin ? 'Douyin' : 'TikTok',
      accentColor: '#ec4899',
      iconName: 'music',
    };
  }
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    return {
      id: 'instagram',
      name: 'Instagram',
      badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      badgeText: 'Instagram',
      accentColor: '#a855f7',
      iconName: 'instagram',
    };
  }
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
    return {
      id: 'facebook',
      name: 'Facebook',
      badgeBg: 'bg-blue-600/10 border-blue-600/30 text-blue-400',
      badgeText: 'Facebook',
      accentColor: '#3b82f6',
      iconName: 'facebook',
    };
  }
  if (lower.includes('twitter.com') || lower.includes('x.com') || lower.includes('t.co')) {
    return {
      id: 'twitter',
      name: 'Twitter / X',
      badgeBg: 'bg-slate-700/30 border-slate-600/50 text-slate-300',
      badgeText: 'X / Twitter',
      accentColor: '#94a3b8',
      iconName: 'twitter',
    };
  }
  if (lower.includes('bilibili.com') || lower.includes('b23.tv')) {
    return {
      id: 'bilibili',
      name: 'Bilibili',
      badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
      badgeText: 'Bilibili',
      accentColor: '#0ea5e9',
      iconName: 'tv',
    };
  }
  if (lower.includes('threads.net')) {
    return {
      id: 'threads',
      name: 'Threads',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badgeText: 'Threads',
      accentColor: '#10b981',
      iconName: 'message-square',
    };
  }
  if (lower.includes('reddit.com') || lower.includes('redd.it')) {
    return {
      id: 'reddit',
      name: 'Reddit',
      badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      badgeText: 'Reddit',
      accentColor: '#f97316',
      iconName: 'message-circle',
    };
  }
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) {
    return {
      id: 'pinterest',
      name: 'Pinterest',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      badgeText: 'Pinterest',
      accentColor: '#f43f5e',
      iconName: 'pin',
    };
  }
  if (lower.includes('vimeo.com')) {
    return {
      id: 'vimeo',
      name: 'Vimeo',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      badgeText: 'Vimeo',
      accentColor: '#06b6d4',
      iconName: 'video',
    };
  }
  if (lower.includes('soundcloud.com')) {
    return {
      id: 'soundcloud',
      name: 'SoundCloud',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badgeText: 'SoundCloud',
      accentColor: '#f59e0b',
      iconName: 'headphones',
    };
  }

  return {
    id: 'generic',
    name: 'Universal Media',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    badgeText: '1600+ Sites',
    accentColor: '#6366f1',
    iconName: 'globe',
  };
}
