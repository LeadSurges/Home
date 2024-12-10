import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SearchFilters } from "@/components/properties/SearchFilters";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertiesMap } from "@/components/properties/PropertiesMap";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";

const Properties = () => {
  const [filters, setFilters] = useState({
    location: "",
    city: "",
    priceRange: [0, 5000000],
    bedroomRange: [1, 7],
    bathroomRange: [1, 5],
    squareFeetRange: [500, 10000],
    homeType: null,
    constructionStatus: null,
    ownershipType: null,
    quickMoveIn: false,
  });

  const [showMap, setShowMap] = useState(true);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      console.log("Fetching properties with filters:", filters);
      
      let query = supabase
        .from("properties")
        .select("*");

      // Apply location filter
      if (filters.location) {
        console.log("Applying location filter:", filters.location);
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Apply city filter
      if (filters.city) {
        console.log("Applying city filter:", filters.city);
        query = query.or(`location.ilike.%${filters.city}%,location.ilike.%${filters.city},%`);
      }

      // Apply range filters
      query = query
        .gte("price", filters.priceRange[0])
        .lte("price", filters.priceRange[1])
        .gte("bedrooms", filters.bedroomRange[0])
        .lte("bedrooms", filters.bedroomRange[1])
        .gte("bathrooms", filters.bathroomRange[0])
        .lte("bathrooms", filters.bathroomRange[1])
        .gte("square_feet", filters.squareFeetRange[0])
        .lte("square_feet", filters.squareFeetRange[1]);

      // Apply additional filters
      if (filters.homeType) {
        query = query.eq("home_type", filters.homeType);
      }
      if (filters.constructionStatus) {
        query = query.eq("construction_status", filters.constructionStatus);
      }
      if (filters.ownershipType) {
        query = query.eq("ownership_type", filters.ownershipType);
      }
      if (filters.quickMoveIn) {
        query = query.eq("quick_move_in", true);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }

      console.log("Fetched properties:", data);
      return data;
    },
  });

  const handleFilterChange = (newFilters: any) => {
    console.log("Applying new filters:", newFilters);
    setFilters(newFilters);
  };

  const handlePropertyClick = (propertyId: string) => {
    window.location.href = `/properties/${propertyId}`;
  };

  return (
    <div className="min-h-screen bg-secondary">
      <SEO 
        title="Properties | LuxuryHomes"
        description="Browse our collection of luxury properties and new construction homes. Find your perfect home today."
        keywords="luxury properties, new homes, real estate listings, premium real estate"
      />
      <Navigation />
      <SearchFilters onFilterChange={handleFilterChange} />
      
      <main className="max-w-[1920px] mx-auto px-4 py-8">
        <div className="flex justify-end mb-4 gap-2">
          <Button
            variant={showMap ? "outline" : "default"}
            size="sm"
            onClick={() => setShowMap(false)}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={showMap ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMap(true)}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`${showMap ? 'lg:w-1/2' : 'w-full'}`}>
            {isLoading ? (
              <div className="text-center py-8">Loading properties...</div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No properties found matching your criteria
              </div>
            )}
          </div>

          {showMap && properties && (
            <div className="lg:w-1/2 h-[calc(100vh-200px)] lg:sticky lg:top-24">
              <div className="glass-card h-full">
                <PropertiesMap 
                  properties={properties} 
                  onPropertyClick={handlePropertyClick}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Properties;