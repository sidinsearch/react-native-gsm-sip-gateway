import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

export default class App extends Component {
  constructor(props) {
    super(props);

    // Show console panel in dev mode (react-native-console-panel does this)
    // this.ConsolePanel = require('react-native-console-panel').displayWhenDev();
  }

  async componentDidMount() {
    // If you have a native module, log it here safely
    // console.log(this.tGateway);
  }

  render() {
    // const ConsolePanel = this.ConsolePanel;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Gateway log</Text>
                {/* {ConsolePanel} */}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    backgroundColor: '#F5F5F5',
  },
  body: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
});
