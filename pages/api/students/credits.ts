import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'vidyalankar-bank-of-credits-secret-key';

// Define interface for token contents
interface JwtPayload {
  id: string;
  roll_number: string;
  name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract authentication token
  const authHeader = req.headers['student-authorization'] as string;
  const token = authHeader?.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const studentId = decoded.id;

    // Calculate total credits
    const { data: totalCreditsData, error: totalCreditsError } = await supabase
      .from('completed_courses')
      .select('credit_awarded')
      .eq('student_id', studentId);

    if (totalCreditsError) {
      console.error('Error fetching total credits:', totalCreditsError);
      return res.status(500).json({ message: 'Failed to fetch credit data' });
    }

    // Calculate sum of credits
    const totalCredits = totalCreditsData.reduce((sum, item) => sum + item.credit_awarded, 0);

    // Get basket-wise breakdown
    const { data: basketCredits, error: basketCreditsError } = await supabase
      .rpc('get_basket_credits_for_student', { student_id: studentId });

    if (basketCreditsError) {
      console.error('Error fetching basket credits:', basketCreditsError);
      
      // Fallback to manual query if RPC function doesn't exist
      const { data: completedCourses, error: completedCoursesError } = await supabase
        .from('completed_courses')
        .select(`
          credit_awarded,
          courses:course_id (vertical, basket, credits)
        `)
        .eq('student_id', studentId);

      if (completedCoursesError) {
        return res.status(500).json({ message: 'Failed to fetch basket credit data' });
      }

      // Manual calculation of basket credits
      const basketMap = new Map();
      
      for (const course of completedCourses) {
        const key = `${course.courses.vertical}|${course.courses.basket}`;
        if (!basketMap.has(key)) {
          basketMap.set(key, {
            vertical: course.courses.vertical,
            basket: course.courses.basket,
            completed_credits: 0
          });
        }
        
        basketMap.get(key).completed_credits += course.credit_awarded;
      }
      
      // Get total credits per basket for all courses (required for progress bars)
      const { data: allCourses, error: allCoursesError } = await supabase
        .from('courses')
        .select('vertical, basket, credits');

      if (allCoursesError) {
        console.error('Error fetching all courses:', allCoursesError);
        // We can still return what we have without total basket credits
        const manualBasketCredits = Array.from(basketMap.values());
        
        return res.status(200).json({
          success: true,
          totalCredits,
          basketCredits: manualBasketCredits.map(basket => ({
            ...basket,
            total_credits: 0 // We don't know the total, so default to 0
          }))
        });
      }

      // Calculate total credits per basket
      const basketTotalMap = new Map();
      
      for (const course of allCourses) {
        const key = `${course.vertical}|${course.basket}`;
        if (!basketTotalMap.has(key)) {
          basketTotalMap.set(key, {
            vertical: course.vertical,
            basket: course.basket,
            total_credits: 0
          });
        }
        
        basketTotalMap.get(key).total_credits += course.credits;
      }

      // Combine the data
      const manualBasketCredits = Array.from(basketMap.values()).map(basket => {
        const key = `${basket.vertical}|${basket.basket}`;
        const totalCreditsForBasket = basketTotalMap.has(key) 
          ? basketTotalMap.get(key).total_credits 
          : 0;
          
        return {
          ...basket,
          total_credits: totalCreditsForBasket
        };
      });

      return res.status(200).json({
        success: true,
        totalCredits,
        basketCredits: manualBasketCredits
      });
    }

    // Return the data
    return res.status(200).json({
      success: true,
      totalCredits,
      basketCredits
    });
  } catch (error) {
    console.error('Error processing credit data:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}