/**
 * Testing utilities for Off Plan Dub.ai
 * Provides tools for browser compatibility testing and bug identification
 */

export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  userAgent: string;
}

export interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  browserInfo: BrowserInfo;
  timestamp: number;
}

/**
 * Detect browser information
 */
export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      name: 'Unknown',
      version: 'Unknown',
      platform: 'Server',
      userAgent: 'N/A',
    };
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  // Edge
  else if (userAgent.includes('Edg')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  // Firefox
  else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  // Safari
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }

  return {
    name: browserName,
    version: browserVersion,
    platform,
    userAgent,
  };
}

/**
 * Check if current browser supports required features
 */
export function checkBrowserCompatibility(): TestResult[] {
  const browserInfo = getBrowserInfo();
  const results: TestResult[] = [];

  // Test ES6 features
  results.push({
    test: 'ES6 Arrow Functions',
    passed: (() => {
      try {
        eval('() => {}');
        return true;
      } catch {
        return false;
      }
    })(),
    browserInfo,
    timestamp: Date.now(),
  });

  // Test Fetch API
  results.push({
    test: 'Fetch API',
    passed: typeof fetch !== 'undefined',
    browserInfo,
    timestamp: Date.now(),
  });

  // Test CSS Grid
  results.push({
    test: 'CSS Grid',
    passed: (() => {
      if (typeof window === 'undefined') return false;
      const div = document.createElement('div');
      return 'grid' in div.style;
    })(),
    browserInfo,
    timestamp: Date.now(),
  });

  // Test Local Storage
  results.push({
    test: 'Local Storage',
    passed: (() => {
      try {
        if (typeof localStorage === 'undefined') return false;
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    browserInfo,
    timestamp: Date.now(),
  });

  // Test Web APIs
  results.push({
    test: 'Intersection Observer',
    passed: typeof IntersectionObserver !== 'undefined',
    browserInfo,
    timestamp: Date.now(),
  });

  return results;
}

/**
 * Test specific application features
 */
export function testApplicationFeatures(): TestResult[] {
  const browserInfo = getBrowserInfo();
  const results: TestResult[] = [];

  // Test image loading
  results.push({
    test: 'Image Loading',
    passed: (() => {
      if (typeof Image === 'undefined') return false;
      try {
        new Image();
        return true;
      } catch {
        return false;
      }
    })(),
    browserInfo,
    timestamp: Date.now(),
  });

  // Test form validation
  results.push({
    test: 'Form Validation',
    passed: (() => {
      if (typeof document === 'undefined') return false;
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.type = 'email';
      input.required = true;
      form.appendChild(input);
      return typeof form.checkValidity === 'function';
    })(),
    browserInfo,
    timestamp: Date.now(),
  });

  return results;
}

/**
 * Performance testing
 */
export function measurePerformance(): Record<string, number> {
  if (typeof performance === 'undefined') {
    return {};
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstContentfulPaint: 0, // Would need to implement with PerformanceObserver
    totalPageLoad: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Log test results to console (dev mode) or send to analytics
 */
export function reportTestResults(results: TestResult[]) {
  const failedTests = results.filter(r => !r.passed);
  
  if (process.env.NODE_ENV === 'development') {
    console.group('Browser Compatibility Test Results');
    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.test}`, result);
    });
    console.groupEnd();

    if (failedTests.length > 0) {
      console.warn(`${failedTests.length} tests failed. Consider providing fallbacks.`);
    }
  }

  // In production, you might want to send this to analytics
  if (process.env.NODE_ENV === 'production' && failedTests.length > 0) {
    // Example: send to analytics service
    // analytics.track('browser_compatibility_issues', { failedTests });
  }

  return {
    total: results.length,
    passed: results.length - failedTests.length,
    failed: failedTests.length,
    results,
  };
}

/**
 * Auto-run compatibility tests on page load
 */
export function initializeQATests() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const compatibilityResults = checkBrowserCompatibility();
    const featureResults = testApplicationFeatures();
    const allResults = [...compatibilityResults, ...featureResults];
    
    reportTestResults(allResults);

    // Store results in sessionStorage for debugging
    try {
      sessionStorage.setItem('qa_test_results', JSON.stringify({
        timestamp: Date.now(),
        browserInfo: getBrowserInfo(),
        results: allResults,
        performance: measurePerformance(),
      }));
    } catch (error) {
      console.warn('Could not store QA results:', error);
    }
  });
}
