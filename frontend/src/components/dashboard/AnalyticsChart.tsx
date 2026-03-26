import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsChartProps {
  tripsData: { labels: string[]; datasets: { data: number[] }[] };
  revenueData: { labels: string[]; datasets: { data: number[] }[] };
  statusData: Array<{ name: string; count: number; color: string; legendFontColor: string; legendFontSize: number }>;
}

const chartConfig = {
  backgroundColor: Colors.white,
  backgroundGradientFrom: Colors.white,
  backgroundGradientTo: Colors.white,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(45, 189, 168, ${opacity})`,
  labelColor: () => Colors.textMuted,
  style: { borderRadius: BorderRadius.md },
  propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
  propsForBackgroundLines: { stroke: Colors.gray100, strokeDasharray: '' },
  barPercentage: 0.5,
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ tripsData, revenueData, statusData }) => {
  const chartWidth = screenWidth - Spacing.md * 4;

  // Ensure minimum datasets to avoid chart rendering issues
  const safeTrips = {
    ...tripsData,
    datasets: [{ data: tripsData.datasets[0].data.map(d => d || 0) }],
  };
  const safeRevenue = {
    ...revenueData,
    datasets: [{ data: revenueData.datasets[0].data.map(d => d || 0) }],
  };

  return (
    <View>
      {/* Trips per month */}
      <View style={[styles.section, Shadows.sm]}>
        <Text style={styles.sectionTitle}>Trips Per Month</Text>
        <Text style={styles.sectionSubtitle}>Monthly trip volume</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={safeTrips}
            width={Math.max(chartWidth, safeTrips.labels.length * 50)}
            height={160}
            chartConfig={{
              ...chartConfig,
              fillShadowGradient: Colors.primary,
              fillShadowGradientOpacity: 0.85,
              barPercentage: 0.45,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            flatColor
            fromZero
            yAxisLabel="" yAxisSuffix=""
          />
        </ScrollView>
      </View>

      {/* Revenue trend */}
      <View style={[styles.section, Shadows.sm]}>
        <Text style={styles.sectionTitle}>Revenue Trend (₹K)</Text>
        <Text style={styles.sectionSubtitle}>Monthly hire collected</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={safeRevenue}
            width={Math.max(chartWidth, safeRevenue.labels.length * 50)}
            height={160}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 140, 66, ${opacity})`,
              propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.secondary },
            }}
            bezier
            style={styles.chart}
            fromZero
          />
        </ScrollView>
      </View>

      {/* Status distribution */}
      {statusData.some((s) => s.count > 0) && (
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Trip Status</Text>
          <Text style={styles.sectionSubtitle}>Breakdown by status</Text>
          <PieChart
            data={statusData}
            width={chartWidth}
            height={140}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="8"
            style={styles.chart}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  chart: {
    borderRadius: BorderRadius.sm,
    marginLeft: -16,
  },
});

export default AnalyticsChart;
