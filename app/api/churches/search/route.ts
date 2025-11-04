// API route for searching existing churches with location-based filtering

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// Haversine formula to calculate distance between two points in miles
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const zipCode = searchParams.get('zipCode');

    // Validate that we have at least one search parameter
    if ((!query || query.trim().length < 2) && !latitude && !zipCode) {
      return NextResponse.json({
        churches: [],
        message: 'Provide a church name (min 2 chars), location, or ZIP code'
      });
    }

    // Build base query
    let supabaseQuery = supabase
      .from('churches')
      .select(`
        id,
        name,
        description,
        created_at,
        campuses (
          id,
          name,
          location,
          latitude,
          longitude,
          zip_code
        )
      `);

    // Add name filter if provided
    if (query && query.trim().length >= 2) {
      supabaseQuery = supabaseQuery.ilike('name', `%${query.trim()}%`);
    }

    // Fetch results (we'll do ZIP filtering after due to nested relationship)
    const { data: churches, error } = await supabaseQuery.limit(100);

    if (error) {
      console.error('Error searching churches:', error);
      return NextResponse.json(
        { error: 'Failed to search churches' },
        { status: 500 }
      );
    }

    let results = churches || [];

    // Filter by ZIP code if provided (client-side filtering due to nested relationship)
    if (zipCode && zipCode.trim()) {
      results = results.filter(church =>
        church.campuses && Array.isArray(church.campuses) &&
        church.campuses.some((campus: any) => campus.zip_code === zipCode.trim())
      );
    }

    // If GPS coordinates provided, calculate distances and sort by proximity
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      if (!isNaN(userLat) && !isNaN(userLon)) {
        results = results.map(church => {
          // Calculate distance to nearest campus
          let minDistance = Infinity;
          let nearestCampus = null;

          if (church.campuses && Array.isArray(church.campuses)) {
            church.campuses.forEach((campus: any) => {
              if (campus.latitude && campus.longitude) {
                const distance = calculateDistance(
                  userLat,
                  userLon,
                  campus.latitude,
                  campus.longitude
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  nearestCampus = campus;
                }
              }
            });
          }

          return {
            ...church,
            distance: minDistance === Infinity ? null : minDistance,
            nearestCampus
          };
        });

        // Sort by distance (closest first), then by name
        results.sort((a: any, b: any) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }
    }

    // Limit to top 10 results
    results = results.slice(0, 10);

    return NextResponse.json({
      churches: results,
      query: query?.trim() || null,
      location: latitude && longitude ? { latitude, longitude } : null,
      zipCode: zipCode?.trim() || null
    });

  } catch (error) {
    console.error('Unexpected error in church search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
