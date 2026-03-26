import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Colors, Typography, Shadows, BorderRadius, Spacing } from '../utils/colors';

// ─── Screens ──────────────────────────────────────────────────────────────
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DriverListScreen from '../screens/drivers/DriverListScreen';
import DriverFormScreen from '../screens/drivers/DriverFormScreen';
import VehicleListScreen from '../screens/vehicles/VehicleListScreen';
import VehicleFormScreen from '../screens/vehicles/VehicleFormScreen';
import TripListScreen from '../screens/trips/TripListScreen';
import TripDetailScreen from '../screens/trips/TripDetailScreen';
import TripFormScreen from '../screens/trips/TripFormScreen';
import ManagersScreen from '../screens/managers/ManagersScreen';

// ─── Param lists ──────────────────────────────────────────────────────────
import {
  RootStackParamList,
  DriversStackParamList,
  VehiclesStackParamList,
  TripsStackParamList,
  DashboardStackParamList,
  ManagersStackParamList,
} from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const DriversStack = createNativeStackNavigator<DriversStackParamList>();
const VehiclesStack = createNativeStackNavigator<VehiclesStackParamList>();
const TripsStack = createNativeStackNavigator<TripsStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const ManagersStack = createNativeStackNavigator<ManagersStackParamList>();

// ─── Shared header style ──────────────────────────────────────────────────
const stackOptions = {
  headerStyle: { backgroundColor: Colors.white },
  headerTitleStyle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold as any,
    color: Colors.textPrimary,
  },
  headerTintColor: Colors.primary,
  headerShadowVisible: false,
  headerBackTitle: '',
  contentStyle: { backgroundColor: Colors.bgPrimary },
};

// ─── Stack Navigators ─────────────────────────────────────────────────────
const DashboardStackNav = () => (
  <DashboardStack.Navigator screenOptions={{ ...stackOptions, headerShown: false }}>
    <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Dashboard' }} />
  </DashboardStack.Navigator>
);

const DriversStackNav = () => (
  <DriversStack.Navigator screenOptions={stackOptions}>
    <DriversStack.Screen name="DriverList" component={DriverListScreen} options={{ title: 'Drivers' }} />
    <DriversStack.Screen name="DriverForm" component={DriverFormScreen}
      options={({ route }) => ({ title: (route.params as any)?.id ? 'Edit Driver' : 'Add Driver' })} />
  </DriversStack.Navigator>
);

const VehiclesStackNav = () => (
  <VehiclesStack.Navigator screenOptions={stackOptions}>
    <VehiclesStack.Screen name="VehicleList" component={VehicleListScreen} options={{ title: 'Vehicles' }} />
    <VehiclesStack.Screen name="VehicleForm" component={VehicleFormScreen}
      options={({ route }) => ({ title: (route.params as any)?.id ? 'Edit Vehicle' : 'Add Vehicle' })} />
  </VehiclesStack.Navigator>
);

const TripsStackNav = () => (
  <TripsStack.Navigator screenOptions={stackOptions}>
    <TripsStack.Screen name="TripList" component={TripListScreen} options={{ title: 'Trips' }} />
    <TripsStack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Trip Details' }} />
    <TripsStack.Screen name="TripForm" component={TripFormScreen}
      options={({ route }) => ({ title: (route.params as any)?.id ? 'Edit Trip' : 'New Trip' })} />
  </TripsStack.Navigator>
);

const ManagersStackNav = () => (
  <ManagersStack.Navigator screenOptions={stackOptions}>
    <ManagersStack.Screen name="ManagerList" component={ManagersScreen} options={{ title: 'Managers' }} />
  </ManagersStack.Navigator>
);

// ─── Tab Navigator ────────────────────────────────────────────────────────
const MainTabs = () => {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Dashboard: ['grid', 'grid-outline'],
            Trips: ['map', 'map-outline'],
            Vehicles: ['bus', 'bus-outline'],
            Drivers: ['people', 'people-outline'],
            Managers: ['settings', 'settings-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return (
            <View style={[styles.tabIconWrap, focused && styles.tabIconActive]}>
              <Ionicons
                name={(focused ? active : inactive) as any}
                size={20}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNav} />
      <Tab.Screen name="Trips" component={TripsStackNav} />
      <Tab.Screen name="Vehicles" component={VehiclesStackNav} />
      <Tab.Screen name="Drivers" component={DriversStackNav} />
      {isAdmin && <Tab.Screen name="Managers" component={ManagersStackNav} />}
    </Tab.Navigator>
  );
};

// ─── Root Navigator ───────────────────────────────────────────────────────
const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen message="Loading..." />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 88 : 68,
    ...Shadows.sm,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600' as any,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabIconWrap: {
    width: 36, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: Colors.primaryBg,
  },
});

export default AppNavigator;
