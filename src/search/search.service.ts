import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessClients } from '../business_clients/business_clients.entity';
import { SearchBusinessClientsDto } from './search.dto';
import { Cache } from 'cache-manager';
import { UserPreferencesService } from 'src/user_preferences/user_preferences.service';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(BusinessClients)
        private readonly businessClientsRepository: Repository<BusinessClients>,
        @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
        private readonly userPreferencesService: UserPreferencesService
    ) { }

    async searchBusinessClients(filters: SearchBusinessClientsDto, userId: string) {
        const { queryString, location, page = 1, limit = 10 } = filters;
        await this.userPreferencesService.addSearchHistory(userId, queryString, location);

        const cacheKey = this.getCacheKey(filters);

        // Check cache first
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            console.log('Returning cached data');
            return cachedData;
        }

        const queryBuilder = this.businessClientsRepository.createQueryBuilder('businessClients');

        if (location) {
            queryBuilder.andWhere(
                `(
                    (
                        SELECT COALESCE(string_agg(s, ', ' ORDER BY 1), '') 
                        FROM unnest(businessClients.shopLocations) s
                    ) ILIKE :location OR
                    EXISTS (
                        SELECT 1 FROM jsonb_array_elements(businessClients.addresses) addr
                        WHERE addr->>'street' ILIKE :location OR
                              addr->>'city' ILIKE :location OR
                              addr->>'district' ILIKE :location OR
                              addr->>'state' ILIKE :location OR
                              addr->>'pincode' ILIKE :location
                    )
                )`,
                { location: `%${location}%` },
            );
        }

        if (queryString) {
            queryBuilder.andWhere(
                `(
                    businessClients.Clientname ILIKE :queryString OR
                    businessClients.shopname ILIKE :queryString OR
                    businessClients.domainname ILIKE :queryString OR
                    businessClients.shopdesc ILIKE :queryString
                )`,
                { queryString: `%${queryString}%` },
            );
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const result = { data, total, page, limit };
        await this.cacheManager.set(cacheKey, result, 300000);

        return result;
    }

    private getCacheKey(filters: SearchBusinessClientsDto): string {
        return `searchBusinesses:${JSON.stringify(filters)}`;
    }

    async clearCache() {
        await this.cacheManager.reset(); // Clear all cached data
    }
}
