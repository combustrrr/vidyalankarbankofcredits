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
    // Fetch the basket credits from the view
    const { data: basketCreditsData, error: basketCreditsError } = await supabase
      .from('basket_credits')
      .select('*')
      .order('vertical', { ascending: true })
      .order('basket', { ascending: true });

    if (basketCreditsError) {
      console.error('Error fetching basket credits:', basketCreditsError);
      return res.status(500).json({ message: 'Failed to fetch basket credits' });
    }

    // Fetch the total credits (sum of all baskets)
    const { data: totalCreditsData, error: totalCreditsError } = await supabase
      .from('total_credits')
      .select('grand_total')
      .single();

    if (totalCreditsError) {
      console.error('Error fetching total credits:', totalCreditsError);
      return res.status(500).json({ message: 'Failed to fetch total credits' });
    }

    // Return the basket credits and total credits data
    return res.status(200).json({
      message: 'Basket credits retrieved successfully',
      basketCredits: basketCreditsData,
      totalCredits: totalCreditsData.grand_total
    });
  } catch (error) {
    console.error('Unexpected error retrieving basket credits:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}