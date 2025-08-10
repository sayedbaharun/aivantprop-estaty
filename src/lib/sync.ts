/**
 * Data Synchronization Service
 * Handles ingestion of Estaty API data into local PostgreSQL database
 */

import { PrismaClient } from '@prisma/client';
import { Estaty, EstatyProperty } from './estaty';
import { slugify } from './utils';

const prisma = new PrismaClient();

interface SyncStats {
  developers: { created: number; updated: number; errors: number };
  cities: { created: number; updated: number; errors: number };
  districts: { created: number; updated: number; errors: number };
  properties: { created: number; updated: number; errors: number };
  units: { created: number; updated: number; errors: number };
  images: { created: number; updated: number; errors: number };
  floorPlans: { created: number; updated: number; errors: number };
  totalTime: number;
  errors: string[];
}

interface SyncOptions {
  full?: boolean; // Full sync vs incremental
  batchSize?: number;
  includeDrafts?: boolean;
  skipImages?: boolean;
  skipFloorPlans?: boolean;
}

/**
 * Main synchronization service
 */
export class PropertySyncService {
  private stats: SyncStats;
  
  constructor() {
    this.stats = {
      developers: { created: 0, updated: 0, errors: 0 },
      cities: { created: 0, updated: 0, errors: 0 },
      districts: { created: 0, updated: 0, errors: 0 },
      properties: { created: 0, updated: 0, errors: 0 },
      units: { created: 0, updated: 0, errors: 0 },
      images: { created: 0, updated: 0, errors: 0 },
      floorPlans: { created: 0, updated: 0, errors: 0 },
      totalTime: 0,
      errors: [],
    };
  }

  /**
   * Full synchronization of all data
   */
  async syncAll(options: SyncOptions = {}): Promise<SyncStats> {
    const startTime = Date.now();
    console.log('🚀 Starting full property synchronization...');

    try {
      // Step 1: Sync filters and reference data
      console.log('📋 Syncing filters and reference data...');
      await this.syncFilters();

      // Step 2: Sync all properties
      console.log('🏢 Syncing properties...');
      await this.syncProperties(options);

      // Step 3: Sync latest updates
      console.log('🔄 Syncing latest updates...');
      await this.syncLatestUpdates();

      this.stats.totalTime = Date.now() - startTime;
      console.log('✅ Synchronization completed successfully!');
      this.logStats();

      return this.stats;
    } catch (error) {
      this.stats.errors.push(`Full sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Incremental sync of latest updates
   */
  async syncLatestUpdates(): Promise<SyncStats> {
    const startTime = Date.now();
    console.log('🔄 Starting incremental sync...');

    try {
      // Get latest created properties
      const latestCreated = await Estaty.getLatestCreated();
      console.log(`📥 Found ${latestCreated.length} newly created properties`);

      for (const property of latestCreated) {
        await this.upsertProperty(property);
      }

      // Get latest updated properties
      const latestUpdated = await Estaty.getLatestUpdated();
      console.log(`📝 Found ${latestUpdated.length} recently updated properties`);

      for (const property of latestUpdated) {
        await this.upsertProperty(property);
      }

      this.stats.totalTime = Date.now() - startTime;
      console.log('✅ Incremental sync completed!');
      this.logStats();

      return this.stats;
    } catch (error) {
      this.stats.errors.push(`Incremental sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Incremental sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync filters and reference data (developers, cities, etc.)
   */
  private async syncFilters(): Promise<void> {
    try {
      const filters = await Estaty.getFilters();

      // Sync developers (support various key names)
      const developers = filters.developers || filters.developer_companies || filters.developerCompanies || [];
      if (developers && Array.isArray(developers)) {
        for (const dev of developers) {
          await this.upsertDeveloper(dev);
        }
      }

      // Sync cities (some APIs return `cites`)
      const cities = filters.cities || filters.cites || [];
      if (cities && Array.isArray(cities)) {
        for (const city of cities) {
          await this.upsertCity(city);
        }
      }

      // Sync districts
      const districts = filters.districts || filters.neighborhoods || [];
      if (districts && Array.isArray(districts)) {
        for (const district of districts) {
          await this.upsertDistrict(district);
        }
      }

      console.log('✅ Filters synchronized successfully');
    } catch (error) {
      console.error('❌ Failed to sync filters:', error);
      this.stats.errors.push(`Filter sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync all properties using filter endpoint
   */
  private async syncProperties(options: SyncOptions): Promise<void> {
    try {
      // Get all properties with basic filters
      const properties = await Estaty.filterProperties({
        currency: 'AED',
        area_unit: 'sqft',
        // Add any additional filters based on options
      });

      console.log(`📥 Found ${properties.length} properties to sync`);

      const batchSize = options.batchSize || 10;
      
      // Process in batches to avoid overwhelming the API
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(property => this.upsertProperty(property, options))
        );

        // Log progress
        const processed = Math.min(i + batchSize, properties.length);
        console.log(`📊 Processed ${processed}/${properties.length} properties`);
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('❌ Failed to sync properties:', error);
      this.stats.errors.push(`Property sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upsert developer data
   */
  private async upsertDeveloper(developerData: any): Promise<string | null> {
    try {
      const developer = await prisma.developer.upsert({
        where: { externalId: developerData.id },
        update: {
          name: developerData.name || developerData.title,
          slug: slugify(developerData.name || developerData.title),
          logo: developerData.logo,
          description: developerData.description,
          website: developerData.website,
          phone: developerData.phone,
          email: developerData.email,
          headquarters: developerData.headquarters,
          updatedAt: new Date(),
        },
        create: {
          externalId: developerData.id,
          name: developerData.name || developerData.title,
          slug: slugify(developerData.name || developerData.title),
          logo: developerData.logo,
          description: developerData.description,
          website: developerData.website,
          phone: developerData.phone,
          email: developerData.email,
          headquarters: developerData.headquarters,
        },
      });

      this.stats.developers.created++;
      return developer.id;
    } catch (error) {
      console.error('❌ Failed to upsert developer:', error);
      this.stats.developers.errors++;
      return null;
    }
  }

  /**
   * Upsert city data
   */
  private async upsertCity(cityData: any): Promise<string | null> {
    try {
      const city = await prisma.city.upsert({
        where: { externalId: cityData.id },
        update: {
          name: cityData.name || cityData.title,
          slug: slugify(cityData.name || cityData.title),
          nameAr: cityData.name_ar,
          latitude: cityData.latitude ? parseFloat(cityData.latitude) : null,
          longitude: cityData.longitude ? parseFloat(cityData.longitude) : null,
          updatedAt: new Date(),
        },
        create: {
          externalId: cityData.id,
          name: cityData.name || cityData.title,
          slug: slugify(cityData.name || cityData.title),
          nameAr: cityData.name_ar,
          latitude: cityData.latitude ? parseFloat(cityData.latitude) : null,
          longitude: cityData.longitude ? parseFloat(cityData.longitude) : null,
        },
      });

      this.stats.cities.created++;
      return city.id;
    } catch (error) {
      console.error('❌ Failed to upsert city:', error);
      this.stats.cities.errors++;
      return null;
    }
  }

  /**
   * Upsert district data
   */
  private async upsertDistrict(districtData: any): Promise<string | null> {
    try {
      // Find the city first
      const city = await prisma.city.findUnique({
        where: { externalId: districtData.city_id },
      });

      if (!city) {
        console.warn(`⚠️ City not found for district ${districtData.name}`);
        return null;
      }

      const district = await prisma.district.upsert({
        where: { externalId: districtData.id },
        update: {
          name: districtData.name || districtData.title,
          slug: slugify(districtData.name || districtData.title),
          nameAr: districtData.name_ar,
          latitude: districtData.latitude ? parseFloat(districtData.latitude) : null,
          longitude: districtData.longitude ? parseFloat(districtData.longitude) : null,
          updatedAt: new Date(),
        },
        create: {
          externalId: districtData.id,
          name: districtData.name || districtData.title,
          slug: slugify(districtData.name || districtData.title),
          nameAr: districtData.name_ar,
          cityId: city.id,
          latitude: districtData.latitude ? parseFloat(districtData.latitude) : null,
          longitude: districtData.longitude ? parseFloat(districtData.longitude) : null,
        },
      });

      this.stats.districts.created++;
      return district.id;
    } catch (error) {
      console.error('❌ Failed to upsert district:', error);
      this.stats.districts.errors++;
      return null;
    }
  }

  /**
   * Upsert property data with full details
   */
  private async upsertProperty(propertyData: EstatyProperty, options: SyncOptions = {}): Promise<void> {
    try {
      // Get detailed property data if we only have basic info
      let fullProperty = propertyData;
      if (!propertyData.images && !propertyData.floor_plans) {
        const detailed = await Estaty.getProperty(propertyData.id);
        if (detailed) {
          fullProperty = detailed;
        }
      }

      // Find or create developer
      // Find or create developer by external id; if filters didn't preload, create on the fly using name
      let developer = await prisma.developer.findUnique({
        where: { externalId: fullProperty.developer_company_id },
      });
      if (!developer && (fullProperty as any).developer_company_id) {
        // Attempt to create with minimal data using developer_company_id and any name field if present
        const devName = (fullProperty as any).developer_name || (fullProperty as any).developer || 'Unknown Developer';
        try {
          developer = await prisma.developer.create({
            data: {
              externalId: fullProperty.developer_company_id,
              name: devName,
              slug: slugify(devName + '-' + fullProperty.developer_company_id),
            }
          });
        } catch {
          // swallow; we'll skip if still not found
        }
      }

      if (!developer) {
        console.warn(`⚠️ Developer not found for property ${fullProperty.title}`);
        return;
      }

      // Find or create city
      let city = await prisma.city.findUnique({
        where: { externalId: fullProperty.city_id },
      });
      if (!city && (fullProperty as any).city_id) {
        const cityName = (fullProperty as any).city_name || 'Unknown City';
        try {
          city = await prisma.city.create({
            data: {
              externalId: fullProperty.city_id,
              name: cityName,
              slug: slugify(cityName + '-' + fullProperty.city_id),
            }
          });
        } catch {
          // ignore
        }
      }

      if (!city) {
        console.warn(`⚠️ City not found for property ${fullProperty.title}`);
        return;
      }

      // Find district if available
      let district = null;
      if (fullProperty.district_id) {
        district = await prisma.district.findUnique({
          where: { externalId: fullProperty.district_id },
        });
      }

      // Generate unique slug for property
      const baseSlug = slugify(fullProperty.title);
      let uniqueSlug = baseSlug;
      let slugCounter = 1;
      
      // Check if slug already exists (excluding current property)
      while (true) {
        const existingProperty = await prisma.property.findUnique({
          where: { slug: uniqueSlug },
        });
        
        // If no existing property with this slug, or it's the same property we're updating
        if (!existingProperty || existingProperty.externalId === fullProperty.id) {
          break;
        }
        
        // Generate new slug with counter
        uniqueSlug = `${baseSlug}-${slugCounter}`;
        slugCounter++;
      }

      // Upsert property
      const property = await prisma.property.upsert({
        where: { externalId: fullProperty.id },
        update: {
          title: fullProperty.title,
          slug: uniqueSlug,
          description: fullProperty.description,
          status: this.mapPropertyStatus(fullProperty.status),
          salesStatus: this.mapSalesStatus(fullProperty.sales_status),
          propertyType: this.mapPropertyType(fullProperty.property_type),
          minPrice: fullProperty.min_price,
          maxPrice: fullProperty.max_price,
          currency: fullProperty.currency || 'AED',
          minArea: fullProperty.min_area,
          maxArea: fullProperty.max_area,
          areaUnit: fullProperty.area_unit || 'sqft',
          latitude: this.parseCoordinateFromAddress(fullProperty.address, 'lat'),
          longitude: this.parseCoordinateFromAddress(fullProperty.address, 'lng'),
          deliveryDate: this.parseDate(fullProperty.delivery_date),
          handoverYear: fullProperty.handover_year,
          handoverQuarter: fullProperty.handover_quarter,
          heroImage: fullProperty.hero_image,
          brochureUrl: fullProperty.brochure_url,
          videoUrl: fullProperty.video_url,
          amenities: fullProperty.amenities || [],
          facilities: fullProperty.facilities || [],
          paymentPlans: this.normalizePaymentPlans(fullProperty.payment_plans),
          districtId: district?.id,
          updatedAt: new Date(),
        },
        create: {
          externalId: fullProperty.id,
          title: fullProperty.title,
          slug: uniqueSlug,
          description: fullProperty.description,
          developerId: developer.id,
          cityId: city.id,
          districtId: district?.id,
          status: this.mapPropertyStatus(fullProperty.status),
          salesStatus: this.mapSalesStatus(fullProperty.sales_status),
          propertyType: this.mapPropertyType(fullProperty.property_type),
          minPrice: fullProperty.min_price,
          maxPrice: fullProperty.max_price,
          currency: fullProperty.currency || 'AED',
          minArea: fullProperty.min_area,
          maxArea: fullProperty.max_area,
          areaUnit: fullProperty.area_unit || 'sqft',
          latitude: this.parseCoordinateFromAddress(fullProperty.address, 'lat'),
          longitude: this.parseCoordinateFromAddress(fullProperty.address, 'lng'),
          deliveryDate: this.parseDate(fullProperty.delivery_date),
          handoverYear: fullProperty.handover_year,
          handoverQuarter: fullProperty.handover_quarter,
          heroImage: fullProperty.hero_image,
          brochureUrl: fullProperty.brochure_url,
          videoUrl: fullProperty.video_url,
          amenities: fullProperty.amenities || [],
          facilities: fullProperty.facilities || [],
          paymentPlans: this.normalizePaymentPlans(fullProperty.payment_plans),
        },
      });

      // Sync images from the actual API field (property_images)
      if (!options.skipImages && fullProperty.property_images) {
        await this.syncPropertyImages(property.id, fullProperty.property_images);
      }

      // Sync floor plans from grouped_apartments (apartment types with potential floor plans)
      if (!options.skipFloorPlans && fullProperty.grouped_apartments) {
        await this.syncPropertyFloorPlans(property.id, fullProperty.grouped_apartments);
      }

      // Sync units from residential_units and commercial_units
      if (fullProperty.residential_units) {
        await this.syncPropertyUnits(property.id, fullProperty.residential_units, 'residential');
      }
      if (fullProperty.commercial_units) {
        await this.syncPropertyUnits(property.id, fullProperty.commercial_units, 'commercial');
      }

      // Legacy fallbacks (in case old structure still exists)
      if (!options.skipImages && fullProperty.images && !fullProperty.property_images) {
        await this.syncPropertyImagesLegacy(property.id, fullProperty.images);
      }
      if (!options.skipFloorPlans && fullProperty.floor_plans && !fullProperty.grouped_apartments) {
        await this.syncPropertyFloorPlansLegacy(property.id, fullProperty.floor_plans);
      }
      if (fullProperty.units && !fullProperty.residential_units && !fullProperty.commercial_units) {
        await this.syncPropertyUnits(property.id, fullProperty.units, 'legacy');
      }

      this.stats.properties.created++;
    } catch (error) {
      console.error(`❌ Failed to upsert property ${propertyData.title}:`, error);
      this.stats.properties.errors++;
      this.stats.errors.push(`Property sync failed for ${propertyData.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync property images from the new API structure (property_images)
   */
  private async syncPropertyImages(propertyId: string, propertyImages: Array<{image: string, property_id: number, type: number}>): Promise<void> {
    try {
      // Clear existing images
      await prisma.propertyImage.deleteMany({
        where: { propertyId },
      });

      // Insert new images
      for (const [index, image] of propertyImages.entries()) {
        await prisma.propertyImage.create({
          data: {
            propertyId,
            url: image.image,
            alt: '', // API doesn't provide alt text
            caption: null, // API doesn't provide captions
            tag: this.mapImageTypeToTag(image.type),
            sortOrder: index,
            width: null,
            height: null,
            fileSize: null,
          },
        });
        this.stats.images.created++;
      }
    } catch (error) {
      console.error('❌ Failed to sync property images:', error);
      this.stats.images.errors++;
    }
  }

  /**
   * Legacy sync property images (fallback)
   */
  private async syncPropertyImagesLegacy(propertyId: string, images: any[]): Promise<void> {
    try {
      // Clear existing images
      await prisma.propertyImage.deleteMany({
        where: { propertyId },
      });

      // Insert new images
      for (const [index, image] of images.entries()) {
        await prisma.propertyImage.create({
          data: {
            propertyId,
            url: image.url || image.image,
            alt: image.alt || '',
            caption: image.caption,
            tag: this.mapImageTag(image.tag),
            sortOrder: image.sort_order || index,
            width: image.width,
            height: image.height,
            fileSize: image.file_size,
          },
        });
        this.stats.images.created++;
      }
    } catch (error) {
      console.error('❌ Failed to sync legacy images:', error);
      this.stats.images.errors++;
    }
  }

  /**
   * Sync property floor plans from grouped_apartments
   */
  private async syncPropertyFloorPlans(propertyId: string, groupedApartments: Array<{Unit_Type: string, Rooms: string, min_price: number, min_area: number, max_price?: number, max_area?: number, floor_plan_image?: string, floor_plan_pdf?: string}>): Promise<void> {
    try {
      // Clear existing floor plans
      await prisma.floorPlan.deleteMany({
        where: { propertyId },
      });

      // Insert floor plans from grouped apartments
      for (const apartment of groupedApartments) {
        // Extract bedroom count from Rooms field
        const bedroomMatch = apartment.Rooms.match(/(\d+)/);
        const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1], 10) : null;
        
        await prisma.floorPlan.create({
          data: {
            propertyId,
            title: `${apartment.Unit_Type} - ${apartment.Rooms}`,
            planType: apartment.floor_plan_image ? '2D' : 'Text',
            bedrooms: bedrooms,
            bathrooms: null, // Not provided in grouped_apartments
            size: apartment.min_area || null,
            imageUrl: apartment.floor_plan_image || null,
            pdfUrl: apartment.floor_plan_pdf || null,
            pages: null,
            width: null,
            height: null,
            fileSize: null,
          },
        });
        this.stats.floorPlans.created++;
      }
    } catch (error) {
      console.error('❌ Failed to sync floor plans from grouped apartments:', error);
      this.stats.floorPlans.errors++;
    }
  }

  /**
   * Legacy sync property floor plans (fallback)
   */
  private async syncPropertyFloorPlansLegacy(propertyId: string, floorPlans: any[]): Promise<void> {
    try {
      // Clear existing floor plans
      await prisma.floorPlan.deleteMany({
        where: { propertyId },
      });

      // Insert new floor plans
      for (const plan of floorPlans) {
        await prisma.floorPlan.create({
          data: {
            propertyId,
            title: plan.title,
            planType: plan.plan_type || '2D',
            bedrooms: plan.bedrooms,
            bathrooms: plan.bathrooms,
            size: plan.size,
            imageUrl: plan.image_url,
            pdfUrl: plan.pdf_url,
            pages: plan.pages || null,
            width: plan.width,
            height: plan.height,
            fileSize: plan.file_size,
          },
        });
        this.stats.floorPlans.created++;
      }
    } catch (error) {
      console.error('❌ Failed to sync legacy floor plans:', error);
      this.stats.floorPlans.errors++;
    }
  }

  /**
   * Sync property units
   */
  private async syncPropertyUnits(propertyId: string, units: any[], unitCategory: string = 'general'): Promise<void> {
    try {
      // Clear existing units
      await prisma.unit.deleteMany({
        where: { propertyId },
      });

      // Check if units is iterable
      if (!units || !Array.isArray(units)) {
        console.log(`⚠️ Skipping units sync for property ${propertyId}: units is not an array`);
        return;
      }

      // Insert new units
      for (const unit of units) {
        await prisma.unit.create({
          data: {
            externalId: unit.id,
            propertyId,
            title: unit.title,
            unitType: unit.unit_type,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            size: unit.size,
            price: unit.price,
            pricePerSqft: unit.price_per_sqft,
            floor: unit.floor,
            view: unit.view,
            orientation: unit.orientation,
            status: this.mapUnitStatus(unit.status),
            availability: unit.availability || 1,
            serviceCharge: unit.service_charge,
            paymentPlan: unit.payment_plan || null,
          },
        });
        this.stats.units.created++;
      }
    } catch (error) {
      console.error('❌ Failed to sync units:', error);
      this.stats.units.errors++;
    }
  }

  /**
   * Safely normalize input to a key string
   */
  private normalizeKey(input: unknown): string {
    if (typeof input === 'string') {
      return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }
    if (Array.isArray(input) && input.length > 0 && typeof input[0] === 'string') {
      return input[0].toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }
    if (input == null) {
      return '';
    }
    return String(input).toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  /**
   * Safely parse date string to Date object or null
   */
  private parseDate(dateInput: unknown): Date | null {
    if (!dateInput) return null;
    
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    
    if (typeof dateInput === 'string') {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date;
    }
    
    if (typeof dateInput === 'number') {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  }

  /**
   * Convert payment plan objects to string array
   */
  private normalizePaymentPlans(plans: unknown): string[] {
    if (!plans || !Array.isArray(plans)) return [];
    
    return plans.map(plan => {
      if (typeof plan === 'string') return plan;
      if (plan && typeof plan === 'object') {
        const name = (plan as any).name || (plan as any).description || 'Payment Plan';
        const description = (plan as any).description || '';
        return description ? `${name}: ${description}` : name;
      }
      return String(plan);
    });
  }

  /**
   * Parse coordinates from address field
   * Estaty API provides coordinates as "lat,lng" string in address field
   */
  private parseCoordinateFromAddress(address: unknown, type: 'lat' | 'lng'): number | null {
    try {
      if (!address || typeof address !== 'string') return null;
      
      // Check if address contains coordinates (lat,lng format)
      const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
      const match = address.trim().match(coordPattern);
      
      if (match) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);
        
        // Validate Dubai coordinate ranges
        // Dubai roughly: Lat 24.5-25.5, Lng 54.5-56.0
        if (latitude >= 24.0 && latitude <= 26.0 && longitude >= 54.0 && longitude <= 57.0) {
          return type === 'lat' ? latitude : longitude;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Utility functions for mapping enum values
   */
  private mapPropertyStatus(status?: unknown) {
    const s = this.normalizeKey(status);
    const statusMap: Record<string, any> = {
      'upcoming': 'UPCOMING',
      'under_construction': 'UNDER_CONSTRUCTION',
      'ready': 'READY',
      'completed': 'COMPLETED',
      'sold_out': 'SOLD_OUT',
    };
    return statusMap[s] || 'UPCOMING';
  }

  private mapSalesStatus(status?: unknown) {
    const s = this.normalizeKey(status);
    const statusMap: Record<string, any> = {
      'available': 'AVAILABLE',
      'limited_availability': 'LIMITED_AVAILABILITY',
      'sold_out': 'SOLD_OUT',
      'coming_soon': 'COMING_SOON',
    };
    return statusMap[s] || 'AVAILABLE';
  }

  private mapPropertyType(type?: unknown) {
    const t = this.normalizeKey(type);
    const typeMap: Record<string, any> = {
      'residential': 'RESIDENTIAL',
      'commercial': 'COMMERCIAL',
      'mixed_use': 'MIXED_USE',
      'industrial': 'INDUSTRIAL',
    };
    return typeMap[t] || 'RESIDENTIAL';
  }

  private mapUnitStatus(status?: unknown) {
    const s = this.normalizeKey(status);
    const statusMap: Record<string, any> = {
      'available': 'AVAILABLE',
      'reserved': 'RESERVED',
      'sold': 'SOLD',
      'not_available': 'NOT_AVAILABLE',
    };
    return statusMap[s] || 'AVAILABLE';
  }

  private mapImageTag(tag?: string) {
    const tagMap: Record<string, any> = {
      'hero': 'HERO',
      'gallery': 'GALLERY',
      'amenity': 'AMENITY',
      'location': 'LOCATION',
      'floor_plan': 'FLOOR_PLAN',
      'exterior': 'EXTERIOR',
      'interior': 'INTERIOR',
      'lifestyle': 'LIFESTYLE',
      'master_plan': 'MASTER_PLAN',
    };
    return tagMap[tag?.toLowerCase() || ''] || 'GALLERY';
  }

  /**
   * Map image type numbers from API to our tag system
   */
  private mapImageTypeToTag(type?: number) {
    // Based on API observations:
    // type 1 = appears to be hero/main images
    // type 2 = appears to be gallery images  
    // type 3 = appears to be amenity/lifestyle images
    const typeMap: Record<number, any> = {
      1: 'HERO',
      2: 'GALLERY', 
      3: 'AMENITY',
    };
    return typeMap[type || 2] || 'GALLERY';
  }

  /**
   * Log synchronization statistics
   */
  private logStats(): void {
    console.log('\n📊 Synchronization Statistics:');
    console.log(`⏱️  Total Time: ${(this.stats.totalTime / 1000).toFixed(2)}s`);
    console.log(`🏢 Developers: ${this.stats.developers.created} created, ${this.stats.developers.errors} errors`);
    console.log(`🏙️  Cities: ${this.stats.cities.created} created, ${this.stats.cities.errors} errors`);
    console.log(`📍 Districts: ${this.stats.districts.created} created, ${this.stats.districts.errors} errors`);
    console.log(`🏗️  Properties: ${this.stats.properties.created} created, ${this.stats.properties.errors} errors`);
    console.log(`🏠 Units: ${this.stats.units.created} created, ${this.stats.units.errors} errors`);
    console.log(`📸 Images: ${this.stats.images.created} created, ${this.stats.images.errors} errors`);
    console.log(`📋 Floor Plans: ${this.stats.floorPlans.created} created, ${this.stats.floorPlans.errors} errors`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.forEach(error => console.log(`   • ${error}`));
    }
  }
}

// Export singleton instance
export const propertySyncService = new PropertySyncService();
