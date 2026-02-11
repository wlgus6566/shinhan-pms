'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useMyProjects, type MyProject } from '@/lib/api/projects';
import type { KeyedMutator } from 'swr';
import type { PaginatedData } from '@repo/schema';

const STORAGE_KEY = 'selectedProjectId';

interface ProjectContextType {
  /** 내가 속한 프로젝트 목록 */
  myProjects: MyProject[] | undefined;
  /** 프로젝트 목록 로딩 상태 */
  isLoading: boolean;
  /** 프로젝트 목록 에러 */
  error: Error | undefined;
  /** 프로젝트 목록 갱신 */
  mutateMyProjects: KeyedMutator<PaginatedData<MyProject>>;
  /** 현재 선택된 프로젝트 ID (없으면 null) */
  selectedProjectId: string | null;
  /** 프로젝트 선택 변경 */
  setSelectedProjectId: (projectId: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { projects: myProjects, isLoading, error, mutate: mutateMyProjects } = useMyProjects();

  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEY);
  });

  const setSelectedProjectId = useCallback((projectId: string | null) => {
    setSelectedProjectIdState(projectId);
    if (projectId) {
      sessionStorage.setItem(STORAGE_KEY, projectId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({ myProjects, isLoading, error, mutateMyProjects, selectedProjectId, setSelectedProjectId }),
    [myProjects, isLoading, error, mutateMyProjects, selectedProjectId, setSelectedProjectId],
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
