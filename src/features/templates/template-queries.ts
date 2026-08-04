"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { templateRepository } from "@/services/template-repository";
import type { EmailDocument } from "@/types";

const templatesKey = ["templates"] as const;

export function useTemplates() {
  return useQuery({
    queryKey: templatesKey,
    queryFn: () => templateRepository.list(),
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (document: EmailDocument) => templateRepository.save(document),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templatesKey }),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templateRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templatesKey }),
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templateRepository.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templatesKey }),
  });
}
