import { Tabs } from 'expo-router';
import { Home, Bot, ShieldAlert, BarChart2, MessageCircle } from 'lucide-react-native';
import { TAB_COLORS as DARK } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: DARK.background,
          borderTopColor: DARK.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: DARK.active,
        tabBarInactiveTintColor: DARK.inactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        headerStyle: { backgroundColor: DARK.background },
        headerTintColor: DARK.text,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
        headerRight: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tổng quan',
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size - 2} />
          ),
          headerTitle: 'HHD-I Dashboard',
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Trợ lý AI',
          tabBarLabel: 'Trợ lý AI',
          tabBarIcon: ({ color, size }) => (
            <Bot color={color} size={size - 2} />
          ),
          headerTitle: 'Trợ lý AI Giao dịch',
        }}
      />
      <Tabs.Screen
        name="risk"
        options={{
          title: 'Rủi ro',
          tabBarLabel: 'Rủi ro',
          tabBarIcon: ({ color, size }) => (
            <ShieldAlert color={color} size={size - 2} />
          ),
          headerTitle: 'Quản lý Rủi ro',
        }}
      />
      <Tabs.Screen
        name="sentiment"
        options={{
          title: 'Tâm lý TT',
          tabBarLabel: 'Tâm lý TT',
          tabBarIcon: ({ color, size }) => (
            <BarChart2 color={color} size={size - 2} />
          ),
          headerTitle: 'Phân tích Tâm lý',
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Hỗ trợ',
          tabBarLabel: 'Hỗ trợ',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size - 2} />
          ),
          headerTitle: 'Hỗ trợ AI 24/7',
        }}
      />
    </Tabs>
  );
}
