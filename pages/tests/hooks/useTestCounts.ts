import { useState, useEffect } from 'react';
import { fetchMockTests } from '../api/mockTestsApi';

export interface TestCounts {
  [testType: string]: {
    [level: string]: number;
  };
}

export const useTestCounts = () => {
  const [testCounts, setTestCounts] = useState<TestCounts>({});
  const [loading, setLoading] = useState(true);
  
  const fetchTestCounts = async () => {
    try {
      setLoading(true);
      const response = await fetchMockTests();
      const tests = response.data;
      
      const counts: TestCounts = {};
      
      tests.forEach(test => {
        if (!counts[test.type]) {
          counts[test.type] = {};
        }
        
        if (!counts[test.type][test.level]) {
          counts[test.type][test.level] = 0;
        }
        
        counts[test.type][test.level]++;
      });
      
      setTestCounts(counts);
    } catch (error) {
      console.error('Error fetching test counts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTestCounts();
  }, []);
  
  const refreshCounts = () => {
    fetchTestCounts();
  };
  
  return { testCounts, loading, refreshCounts };
};