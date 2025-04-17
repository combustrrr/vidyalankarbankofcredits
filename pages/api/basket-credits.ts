import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../config';

// Initialize Supabase client
const supabaseUrl = supabaseConfig.url;
const supabaseServiceKey = supabaseConfig.serviceRoleKey;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get basket credits from the physical basket_credits table
    const { data: basketData, error: basketError } = await supabase
      .from('basket_credits')
      .select('*')
      .order('vertical', { ascending: true })
      .order('basket', { ascending: true });

    if (basketError) {
      console.error('Error fetching basket credits:', basketError);
      return res.status(500).json({
        message: 'Error fetching basket credits',
        basketCredits: [],
        totalCredits: 0
      });
    }

    // Get total from all basket credits
    const totalCredits = basketData?.reduce((sum, basket) => sum + (basket.total_credits || 0), 0) || 0;
    
    return res.status(200).json({
      message: 'Basket credits retrieved successfully',
      basketCredits: basketData || [],
      totalCredits
    });
  } catch (error) {
    console.error('Unexpected error fetching basket credits:', error);
    return res.status(500).json({
      message: 'An unexpected error occurred',
      basketCredits: [],
      totalCredits: 0
    });
  }
}
