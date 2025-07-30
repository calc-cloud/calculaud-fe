import {useQuery} from '@tanstack/react-query';

import {responsibleAuthorityService} from '@/services/responsibleAuthorityService';
import {ResponsibleAuthority} from '@/types/responsibleAuthorities';

// Hook for fetching pending authorities (called responsible_authority in API)
export const useResponsibleAuthorities = () => {
    const {data, isLoading, error} = useQuery({
        queryKey: ['responsible-authorities'],
        queryFn: async () => {
            const response = await responsibleAuthorityService.getResponsibleAuthorities();
            return response.items;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        responsibleAuthorities: data || [] as ResponsibleAuthority[],
        isLoading,
        error
    };
};