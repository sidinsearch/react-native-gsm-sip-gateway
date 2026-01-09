import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Gateway from './src/Gateway';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: [],
    };
    this.scrollViewRef = React.createRef();
    this.gateway = null;
    
    // Intercept console methods
    this.originalConsoleLog = console.log;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;
    
    console.log = (...args) => {
      this.addLog('log', args);
      this.originalConsoleLog.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.addLog('warn', args);
      this.originalConsoleWarn.apply(console, args);
    };
    
    console.error = (...args) => {
      this.addLog('error', args);
      this.originalConsoleError.apply(console, args);
    };
  }

  addLog = (type, args) => {
    const timestamp = new Date().toLocaleTimeString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    this.setState(prevState => ({
      logs: [...prevState.logs, { type, message, timestamp }],
    }), () => {
      // Auto-scroll to bottom
      if (this.scrollViewRef.current) {
        this.scrollViewRef.current.scrollToEnd({ animated: true });
      }
    });
  };

  async componentDidMount() {
    if (Platform.OS === 'android') {
      await this.ensurePhoneStatePermission();
    }
    
    // Initialize Gateway
    this.gateway = new Gateway();
    this.gateway.onCreate();
  }

  componentWillUnmount() {
    // Restore original console methods
    console.log = this.originalConsoleLog;
    console.warn = this.originalConsoleWarn;
    console.error = this.originalConsoleError;
    
    // Cleanup Gateway
    if (this.gateway) {
      this.gateway.destroy();
    }
  }

  async ensurePhoneStatePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: 'Phone Permission Required',
          message:
            'This app needs access to phone state for SIP and call handling.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission denied',
          'Phone state permission is required for the app to work properly.'
        );
      }
    } catch (err) {
      console.warn('Permission error:', err);
    }
  }

  getLogColor = (type) => {
    switch (type) {
      case 'error':
        return '#D32F2F';
      case 'warn':
        return '#F57C00';
      default:
        return '#1976D2';
    }
  };

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.body}>
            <View style={styles.header}>
              <Text style={styles.sectionTitle}>Gateway Log</Text>
              <Text style={styles.logCount}>
                {this.state.logs.length} {this.state.logs.length === 1 ? 'log' : 'logs'}
              </Text>
            </View>
            <ScrollView
              ref={this.scrollViewRef}
              style={styles.logScrollView}
              contentContainerStyle={styles.logContent}
            >
              {this.state.logs.length === 0 ? (
                <Text style={styles.noLogsText}>No logs yet...</Text>
              ) : (
                this.state.logs.map((log, index) => (
                  <View key={index} style={styles.logEntry}>
                    <View style={styles.logHeader}>
                      <Text style={styles.timestamp}>{log.timestamp}</Text>
                      <Text style={[styles.logType, { color: this.getLogColor(log.type) }]}>
                        {log.type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.logMessage, { color: this.getLogColor(log.type) }]}>
                      {log.message}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
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
  body: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1976D2',
  },
  logCount: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  logScrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  logContent: {
    padding: 12,
  },
  noLogsText: {
    color: '#9E9E9E',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  logEntry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#5E35B1',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logType: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#212121',
  },
});
