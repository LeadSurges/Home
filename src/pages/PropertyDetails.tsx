import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PropertyMainInfo } from "@/components/properties/PropertyMainInfo";
import { PropertyContactForm } from "@/components/properties/PropertyContactForm";
import { FloorplanCard } from "@/components/properties/FloorplanCard";
import { ImageGallery } from "@/components/properties/ImageGallery";
import { SimilarProperties } from "@/components/properties/SimilarProperties";
import { PropertyNavigation } from "@/components/properties/details/PropertyNavigation";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";

const PropertyDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Extract the UUID from the slug using a regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = slug?.match(uuidPattern);
  const id = match ? match[0] : null;

  console.log("Extracted ID from slug:", id); // Debug log

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) {
        console.error("No valid property ID found in URL");
        throw new Error("No valid property ID found in URL");
      }
      
      console.log("Fetching property with ID:", id); // Debug log
      
      const { data, error } = await supabase
        .from("properties")
        .select("*, builders(name, id)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching property:", error);
        throw error;
      }
      
      if (!data) {
        console.error("Property not found");
        throw new Error("Property not found");
      }

      console.log("Fetched property:", data);
      return data;
    },
    retry: false,
    enabled: !!id && uuidPattern.test(id), // Only run query if we have a valid UUID
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  if (!id || !property) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Property not found</h1>
          <p className="mt-4">The property you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  const images = property.image_url ? property.image_url.split(',') : ['/placeholder.svg'];

  const propertyMainInfo = {
    ...property,
    builder: property.builders,
  };

  const isPropertyFavorite = isFavorite(property.id);

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error("Please sign in to save favorites", {
        action: {
          label: "Sign up",
          onClick: () => navigate("/signup")
        }
      });
      return;
    }

    try {
      if (isPropertyFavorite) {
        await removeFavorite(property.id);
      } else {
        await addFavorite(property.id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <SEO
        title={`${property.title} | LuxuryHomes`}
        description={`${property.title} - ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.square_feet} sq ft luxury home in ${property.location}. ${property.description?.slice(0, 150)}...`}
        keywords={`${property.location} homes, ${property.bedrooms} bedroom house, luxury properties, new construction, ${property.home_type}, ${property.construction_status}`}
        image={images[0]}
        type="property"
        propertyData={{
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareFeet: property.square_feet,
          location: property.location,
        }}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Properties", item: "/properties" },
          { name: property.title, item: `/property/${slug}` }
        ]}
      />
      
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PropertyNavigation
          title={property.title}
          isPropertyFavorite={isPropertyFavorite}
          onFavoriteClick={handleFavoriteClick}
        />

        <div className="space-y-8">
          <ImageGallery images={images} title={property.title} />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <PropertyMainInfo {...propertyMainInfo} />

              {property.floorplan_url && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Floor Plans</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <FloorplanCard
                      name={property.title}
                      price={property.price}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      squareFeet={property.square_feet}
                      imageUrl={property.floorplan_url}
                      status={property.floorplan_status}
                    />
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <PropertyContactForm propertyTitle={property.title} />
              </div>
            </div>
          </div>

          <SimilarProperties 
            currentPropertyId={property.id} 
            location={property.location}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PropertyDetails;