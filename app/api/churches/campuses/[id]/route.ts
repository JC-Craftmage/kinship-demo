// API route for updating and deleting a campus

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campusId = params.id;

    // Get campus to verify church ownership
    const { data: campus, error: campusFetchError } = await supabase
      .from('campuses')
      .select('church_id')
      .eq('id', campusId)
      .single();

    if (campusFetchError || !campus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }

    // Verify user is an owner of this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', campus.church_id)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can edit campuses' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, location, address, zip_code } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Campus name is required' },
        { status: 400 }
      );
    }

    // Update campus
    const { data: updatedCampus, error: updateError } = await supabase
      .from('campuses')
      .update({
        name: name.trim(),
        location: location?.trim() || null,
        address: address?.trim() || null,
        zip_code: zip_code?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campusId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating campus:', updateError);
      return NextResponse.json(
        { error: 'Failed to update campus' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campus: updatedCampus,
    });

  } catch (error) {
    console.error('Unexpected error updating campus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campusId = params.id;

    // Get campus to verify church ownership
    const { data: campus, error: campusFetchError } = await supabase
      .from('campuses')
      .select('church_id')
      .eq('id', campusId)
      .single();

    if (campusFetchError || !campus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }

    // Verify user is an owner of this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', campus.church_id)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can delete campuses' },
        { status: 403 }
      );
    }

    // Delete campus (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('campuses')
      .delete()
      .eq('id', campusId);

    if (deleteError) {
      console.error('Error deleting campus:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete campus' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campus deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error deleting campus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
