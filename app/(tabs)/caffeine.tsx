import { View, Text, StyleSheet } from 'react-native';

export default function CaffeineTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Caffeine Log</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});
