import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Send, Bot, User, MessageCircle } from 'lucide-react-native';
import type { ChatMessage } from '@hhd-i/types';

const COLORS = {
  bg: '#0B0E11',
  card: '#131722',
  border: '#2B3139',
  brand: '#F0B90B',
  text: '#EAECEF',
  muted: '#707A8A',
  dark700: '#1E2329',
  success: '#0ECB81',
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const FAQ_ITEMS = [
  'Cách rút tiền?',
  'Phí giao dịch?',
  'Bảo mật tài khoản',
  'DCA là gì?',
  'Kết nối ví?',
  'Coin được hỗ trợ?',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    'Xin chào! Tôi là trợ lý hỗ trợ của HHD-I. Tôi có thể giúp bạn về tài khoản, giao dịch, bảo mật và các tính năng của nền tảng. Bạn cần hỗ trợ gì hôm nay?',
  timestamp: new Date().toISOString(),
};

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageRow, isUser && styles.messageRowReverse]}>
      <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarBot]}>
        {isUser ? <User size={13} color="#000" /> : <Bot size={13} color={COLORS.success} />}
      </View>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function SupportTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(
    async (content?: string) => {
      const trimmed = (content ?? input).trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      const assistantId = generateId();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ]);
      setInput('');
      setIsLoading(true);

      try {
        const allMessages = [...messages, userMsg];
        const res = await fetch(`${API_BASE}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages }),
        });

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No body');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.' }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Trực tuyến — AI hỗ trợ 24/7</Text>
      </View>

      {/* FAQ Quick Access */}
      <View style={styles.faqContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.faqScroll}>
          {FAQ_ITEMS.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.faqChip}
              onPress={() => sendMessage(q)}
              activeOpacity={0.7}
            >
              <Text style={styles.faqChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isLoading && messages[messages.length - 1]?.content === '' ? (
            <View style={styles.messageRow}>
              <View style={styles.avatarBot}>
                <MessageCircle size={13} color={COLORS.success} />
              </View>
              <View style={[styles.bubbleBot, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <ActivityIndicator size="small" color={COLORS.success} />
                <Text style={styles.loadingText}>AI đang trả lời...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Nhập câu hỏi..."
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          multiline
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Send size={16} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  statusText: { color: COLORS.success, fontSize: 12, fontWeight: '500' },
  faqContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
  },
  faqScroll: { paddingHorizontal: 12, gap: 8 },
  faqChip: {
    backgroundColor: COLORS.dark700,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  faqChipText: { color: COLORS.muted, fontSize: 12 },
  listContent: { padding: 16, paddingBottom: 8, gap: 12 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  messageRowReverse: { flexDirection: 'row-reverse' },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  avatarUser: { backgroundColor: COLORS.brand },
  avatarBot: {
    backgroundColor: COLORS.dark700,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  bubbleUser: {
    backgroundColor: COLORS.brand,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: COLORS.dark700,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  bubbleTextUser: { color: '#000', fontWeight: '500' },
  loadingText: { color: COLORS.muted, fontSize: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.dark700,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 13,
    maxHeight: 90,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
