/**
 * Estaty API Integration Layer
 * Secure server-side API client for Estaty property data
 */

const BASE_URL = process.env.ESTATY_BASE_URL!;
const API_KEY = process.env.ESTATY_API_KEY!;

if (!BASE_URL || !API_KEY) {
  throw new Error('Missing required Estaty API configuration. Check your environment variables.');
}

// Request/Response Types
interface EstatyResponse<T> {
  properties?: T[];
  property?: T;
  cities?: any[];
  views?: any[];
  [key: string]: any;
}

interface EstatyProperty {
  id: number;
  title: string;
  developer_company_id: number;
  city_id: number;
  district_id?: number;
  status?: string;
  sales_status?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  currency?: string;
  area_unit?: string;
  delivery_date?: string;
  handover_year?: number;
  handover_quarter?: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  amenities?: string[];
  facilities?: string[];
  payment_plans?: string[];
  hero_image?: string;
  brochure_url?: string;
  video_url?: string;
  // Real API fields for images
  property_images?: Array<{
    image: string;
    property_id: number;
    type: number;
  }>;
  
  // Legacy field names (might still exist)
  images?: Array<{
    url: string;
    alt?: string;
    tag?: string;
    sort_order?: number;
  }>;
  
  // Apartment/unit groupings with floor plan data
  grouped_apartments?: Array<{
    Unit_Type: string;
    Rooms: string;
    min_price: number;
    min_area: number;
    max_price?: number;
    max_area?: number;
    floor_plan_image?: string;
    floor_plan_pdf?: string;
  }>;
  
  // Residential units
  residential_units?: Array<{
    id?: number;
    title: string;
    unit_type: string;
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    price?: number;
    price_per_sqft?: number;
    floor?: number;
    view?: string;
    orientation?: string;
    status?: string;
    availability?: number;
    service_charge?: number;
    payment_plan?: any;
    floor_plan_image?: string;
    floor_plan_pdf?: string;
  }>;
  
  // Commercial units  
  commercial_units?: Array<{
    id?: number;
    title: string;
    unit_type: string;
    size?: number;
    price?: number;
    price_per_sqft?: number;
    floor?: number;
    status?: string;
    availability?: number;
    service_charge?: number;
    payment_plan?: any;
  }>;
  
  // Legacy field names (might still exist)
  floor_plans?: Array<{
    title: string;
    plan_type: string;
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    image_url?: string;
    pdf_url?: string;
    pages?: any;
  }>;
  units?: Array<{
    id?: number;
    title: string;
    unit_type: string;
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    price?: number;
    price_per_sqft?: number;
    floor?: number;
    view?: string;
    orientation?: string;
    status?: string;
    availability?: number;
    service_charge?: number;
    payment_plan?: any;
  }>;
}

interface FilterOptions {
  search_type?: number;
  sorting_by?: number;
  property_name?: string;
  developer_company_id?: string[];
  marketing_agency_id?: string[];
  city_id?: string[];
  district_id?: string[];
  status?: string[];
  sales_status?: string[];
  property_type?: string[];
  apartmentType?: string[];
  apartments?: string[];
  facilities?: string[];
  guarantee_rental_guarantee?: string[];
  payment_plan?: string[];
  post_delivery?: string[];
  delivery_date?: string;
  max_down_payment?: string[];
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  currency: string;
  area_unit: string;
}

/**
 * Generic API request helper
 */
async function estatyRequest<T>(
  endpoint: string,
  body?: Record<string, any>
): Promise<EstatyResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'App-key': API_KEY,
      },
      body: JSON.stringify(body || {}),
    });

    if (!response.ok) {
      throw new Error(`Estaty API ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Estaty API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Estaty API Client
 */
export const Estaty = {
  /**
   * Get the latest 10 created properties
   */
  async getLatestCreated(): Promise<EstatyProperty[]> {
    const response = await estatyRequest<EstatyProperty>('/api/v1/latestCreatedProperties');
    return response.properties || [];
  },

  /**
   * Get the latest 10 updated properties
   */
  async getLatestUpdated(): Promise<EstatyProperty[]> {
    const response = await estatyRequest<EstatyProperty>('/api/v1/latestUpdatedProperties');
    return response.properties || [];
  },

  /**
   * Get all properties with optional sorting
   */
  async getProperties(sortingBy?: string): Promise<EstatyProperty[]> {
    const body = sortingBy ? { sorting_by: sortingBy } : {};
    const response = await estatyRequest<EstatyProperty>('/api/v1/getProperties', body);
    return response.properties || [];
  },

  /**
   * Get single property by ID
   */
  async getProperty(id: number): Promise<EstatyProperty | null> {
    const response = await estatyRequest<EstatyProperty>('/api/v1/getProperty', { id });
    return response.property || null;
  },

  /**
   * Get all available filters
   */
  async getFilters(): Promise<{
    cities: any[];
    views: any[];
    developers: any[];
    districts: any[];
    property_types: any[];
    amenities: any[];
    facilities: any[];
    payment_plans: any[];
    [key: string]: any;
  }> {
    const response = await estatyRequest('/api/v1/getFilters');
    // Normalize possible key variations from Estaty API
    const cities = response.cities || response.cites || [];
    const developers = response.developers || response.developer_companies || response.developerCompanies || [];
    const districts = response.districts || response.neighborhoods || [];
    const property_types = response.property_types || response.propertyTypes || [];
    const amenities = response.amenities || [];
    const facilities = response.facilities || [];
    const payment_plans = response.payment_plans || response.paymentPlans || [];

    return {
      cities,
      views: response.views || [],
      developers,
      districts,
      property_types,
      amenities,
      facilities,
      payment_plans,
      ...response,
    };
  },

  /**
   * Filter properties with advanced criteria
   */
  async filterProperties(options: FilterOptions): Promise<EstatyProperty[]> {
    // Ensure required fields are present
    const body = {
      currency: 'AED',
      area_unit: 'sqft',
      ...options,
    };
    
    const response = await estatyRequest<EstatyProperty>('/api/v1/filter', body);
    return response.properties || [];
  },

  /**
   * Batch fetch properties by IDs
   */
  async getPropertiesByIds(ids: number[]): Promise<EstatyProperty[]> {
    const properties = await Promise.allSettled(
      ids.map(id => this.getProperty(id))
    );
    
    return properties
      .filter((result): result is PromiseFulfilledResult<EstatyProperty | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as EstatyProperty);
  },

  /**
   * Search properties by name/title
   */
  async searchProperties(query: string, limit?: number): Promise<EstatyProperty[]> {
    const properties = await this.filterProperties({
      property_name: query,
      currency: 'AED',
      area_unit: 'sqft',
    });
    
    return limit ? properties.slice(0, limit) : properties;
  },

  /**
   * Get properties by developer
   */
  async getPropertiesByDeveloper(developerIds: string[]): Promise<EstatyProperty[]> {
    return this.filterProperties({
      developer_company_id: developerIds,
      currency: 'AED',
      area_unit: 'sqft',
    });
  },

  /**
   * Get properties by city
   */
  async getPropertiesByCity(cityIds: string[]): Promise<EstatyProperty[]> {
    return this.filterProperties({
      city_id: cityIds,
      currency: 'AED',
      area_unit: 'sqft',
    });
  },

  /**
   * Get properties by price range
   */
  async getPropertiesByPriceRange(
    minPrice?: number,
    maxPrice?: number
  ): Promise<EstatyProperty[]> {
    return this.filterProperties({
      min_price: minPrice,
      max_price: maxPrice,
      currency: 'AED',
      area_unit: 'sqft',
    });
  },
};

export type { EstatyProperty, FilterOptions };
