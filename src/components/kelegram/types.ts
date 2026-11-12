export type KelegramChatType = 'direct' | 'group' | 'channel' | 'bot' | 'saved';

export type KelegramFolder = 'all' | 'direct' | 'groups' | 'channels' | 'bots' | 'saved';

export interface KelegramAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'archive' | 'sheet';
  url?: string;
  previewUrl?: string;
}

export interface KelegramVoiceNote {
  durationSec: number;
  waveform: number[];
  audioUrl?: string;
}

export interface KelegramSticker {
  id: string;
  emoji: string;
  labelKu: string;
  labelEn: string;
  bgGradient: string;
}

export interface KelegramBotButton {
  text: string;
  command: string;
  badge?: string;
}

export interface KelegramMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  text?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isOutgoing: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: Record<string, number>;
  userReactions?: string[];
  voiceNote?: KelegramVoiceNote;
  attachment?: KelegramAttachment;
  sticker?: KelegramSticker;
  isDirective?: boolean;
  priority?: 'NORMAL' | 'URGENT' | 'HOLDING_DIRECTIVE';
  viewsCount?: number;
  isPinned?: boolean;
  botButtons?: KelegramBotButton[][];
}

export interface KelegramChat {
  id: string;
  type: KelegramChatType;
  name: string;
  nameKu?: string;
  nameAr?: string;
  avatar: string;
  avatarBg?: string;
  onlineStatus?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  unreadCount: number;
  lastMessageText: string;
  lastMessageTime: string;
  folder: KelegramFolder;
  pinnedMessage?: string;
  bio?: string;
  phone?: string;
  username?: string;
  managerId?: string;
  companyName?: string;
  subscribersCount?: number;
  membersCount?: number;
}
