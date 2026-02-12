'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * URL 쿼리 파라미터와 동기화되는 탭 네비게이션 훅
 *
 * @param basePath - 기본 URL 경로 (예: `/projects/${id}`, `/work-logs`)
 * @param options.defaultTab - 기본 탭 값 (기본값: 'info')
 * @param options.queryKey - URL 쿼리 파라미터 키 (기본값: 'tab')
 *
 * @example
 * // 프로젝트 상세 페이지
 * const { activeTab, handleTabChange } = useTabNavigation(`/projects/${projectId}`, {
 *   defaultTab: 'info'
 * });
 *
 * @example
 * // 업무일지 페이지 (프로젝트 필터)
 * const { activeTab, handleTabChange } = useTabNavigation('/work-logs', {
 *   defaultTab: 'all',
 *   queryKey: 'project'
 * });
 */
export function useTabNavigation(
  basePath: string,
  options: {
    defaultTab?: string;
    queryKey?: string;
  } = {},
) {
  const { defaultTab = 'info', queryKey = 'tab' } = options;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(
    searchParams.get(queryKey) || defaultTab,
  );

  // URL 파라미터 변경 시 탭 동기화 (브라우저 뒤로/앞으로 대응)
  useEffect(() => {
    const tabParam = searchParams.get(queryKey) || defaultTab;
    setActiveTab((prev) => (prev !== tabParam ? tabParam : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, queryKey]);

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      const newUrl =
        value === defaultTab
          ? basePath
          : `${basePath}?${queryKey}=${value}`;
      router.push(newUrl, { scroll: false });
    },
    [basePath, defaultTab, queryKey, router],
  );

  return { activeTab, handleTabChange };
}
